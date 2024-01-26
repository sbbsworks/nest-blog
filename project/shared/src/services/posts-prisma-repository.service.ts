import {Inject, Injectable} from "@nestjs/common/decorators"
import {EDbDates, EId, EPrismaDbTables} from "../entities/db.entity"
import {MemoryStoredFile } from "nestjs-form-data"
import {readFile} from 'node:fs/promises'
import {ABlogPrismaRepository, EPrismaQueryFields, EPrismaSortedPaginationFields, ESortByOrder, TPrismaSortedPagination, TWhereParameters} from "../lib/abstract-prisma-repository"
import {BlogPrismaService} from "./blog-prisma.service"
import {EPostDTOFields, EPostDbEntityFields, EPostSortBy, EPostState, PostDTO, RePublishPostDateDTO, ReturnedPostRDO, TPostId } from "@shared"
import {Prisma, $Enums} from "@prisma-blog/client"
import {JsonValue} from "@prisma/client/runtime/library"
import {EUserDTOFields, TUserId} from "../dtos/user.dto"
import {EPaginationFields, SortedPaginationDTO} from "../dtos/pagination.dto"
import {appConfig} from "../configs/app.config"
import {ConfigType} from "@nestjs/config"

export type TPrismaClientPostsTable = BlogPrismaService[EPrismaDbTables.posts]
export type TTagsConnectOrCreate = {
    [EPostDbEntityFields.tags]?: {connectOrCreate: {
        where: { name: string },
        create: { name: string },
    }[]}
}
export type TTagsDisconnect = {[EPostDbEntityFields.tags]?: {[EPrismaQueryFields.set]: []}} | {[EPostDbEntityFields.tags]?: {[EPrismaQueryFields.disconnect]: string[]}}
export type TDbTags = {[EPostDbEntityFields.tags]: {id:string; [EPrismaQueryFields.name]:string}[]}
export type TPostEntity = {
    [EPostDbEntityFields.postType]: $Enums.EPostType;
    [EPostDbEntityFields.postBody]: Prisma.JsonObject;
    [EPostDbEntityFields.userId]?: string;
    [EDbDates.publishedAt]?: Date;
} & (TTagsConnectOrCreate|TTagsDisconnect)

export type TRepostedPost = {
    [EPostDbEntityFields.userId]: string;
    [EPostDbEntityFields.postType]: $Enums.EPostType;
    [EPostDbEntityFields.originalPostId]: TPostId;
    [EPostDbEntityFields.originalAuthorId]: TUserId;
    [EPostDbEntityFields.postBody]: Prisma.JsonValue;
    [EPostDbEntityFields.tags]: {connect: {id:string,name:string}[]};
}

@Injectable()
export class PostsPrismaRepositoryService extends ABlogPrismaRepository<TPostEntity>{
    #rawClient:TPrismaClientPostsTable
    constructor(
        protected readonly prismaClient: BlogPrismaService,
        @Inject(appConfig.KEY)
        private readonly _appConfig: ConfigType<typeof appConfig>
    ) {
        super(prismaClient[EPrismaDbTables.posts])
        this.#rawClient = prismaClient[EPrismaDbTables.posts]
    }
    async addPostWithTransaction(post: Required<Pick<TPostEntity, EPostDbEntityFields.userId>> & TTagsConnectOrCreate & TPostEntity, callback: (newPostId: TPostId) => Promise<boolean>) {
        return await this.prismaClient.$transaction(async (prisma) => {
            const newPost = await prisma[EPrismaDbTables.posts].create({
                data: {...post, ...{[EDbDates.createdAt]: new Date(), [EDbDates.updatedAt]: new Date()}}
            })
            const addedToQueue = await callback(newPost[EId.id])
            return {newPostId: newPost[EId.id], addedToQueue}
        })
    }
    async preparePost(post: Omit<PostDTO, EUserDTOFields.fullName>, isNew = false): Promise<TPostEntity> {
        const _post: TPostEntity = {
            [EPostDbEntityFields.postType]: post[EPostDTOFields.postType],
            [EPostDbEntityFields.postBody]: {},
        }
        if(post.userId) {
            _post[EPostDbEntityFields.userId] = `${post.userId}`
        }
        if(post[EPostDTOFields.tags]) {
            _post[EPostDTOFields.tags] = {
                [EPrismaQueryFields.set]: `${post.userId}` ? undefined : [],
                [EPrismaQueryFields.connectOrCreate]: [...post[EPostDTOFields.tags].map((tag) => {
                    return {
                        [EPrismaQueryFields.where]: { [EPrismaQueryFields.name]: tag },
                        [EPrismaQueryFields.create]: { [EPrismaQueryFields.name]: tag },
                    }
                })
            ]}
        }
        if(!post[EPostDTOFields.tags] && !isNew) {
            _post[EPostDTOFields.tags] = {[EPrismaQueryFields.set]: []}
        }
        const body = {} as TPostEntity[EPostDbEntityFields.postBody]
        for(const key of Object.keys(post)) {
            if(
                key === EPostDTOFields.postType ||
                key === EPostDTOFields.tags ||
                key === EUserDTOFields.userId ||
                key === EUserDTOFields[EUserDTOFields.fullName] ||
                key === 'postId'
            ) {
                continue
            }
            if(post[key as keyof Omit<PostDTO, EUserDTOFields.fullName>]) {
                if(key === EPostDTOFields.photo) {
                    body[key] = await this.#preparePhoto(post[key] as MemoryStoredFile)
                    continue
                }
                body[key] = post[key as keyof Omit<PostDTO, EUserDTOFields.fullName>] as JsonValue
            }
        }
        _post[EPostDbEntityFields.postBody] = {...body}
        return _post
    }
    async #preparePhoto(photo: MemoryStoredFile): Promise<string> {
        //@ts-ignore
        const _photo = await readFile(photo.path, 'base64')
        //@ts-ignore
        return `data:${photo.fileType.mime};base64,${_photo}`
    }
    async prepareRepublishedPost(data: RePublishPostDateDTO): Promise<Omit<TPostEntity, EPostDbEntityFields.postType|EPostDbEntityFields.postBody>> {
        const _post:Omit<TPostEntity, EPostDbEntityFields.postType|EPostDbEntityFields.postBody> = {
            [EDbDates.publishedAt]: data.publishedAt
        }
        return _post
    }
    async repost(postId: TPostId, userId: string): Promise<TPostId|undefined> {
        const originalPost = await this.prismaClientModel.findUnique({
            [EPrismaQueryFields.where]: {
                id: postId,
                rePosted: false,
                [EPrismaQueryFields.not]: {
                    [EPostDbEntityFields.userId]: userId,
                },
            },
            include: {tags: true}
        })
        if(!originalPost) {
            return undefined
        }
        const repostedPost:TRepostedPost = {
            [EPostDbEntityFields.userId]: userId,
            [EPostDbEntityFields.postType]: originalPost.type,
            [EPostDbEntityFields.originalPostId]: originalPost[EId.id] as TPostId,
            [EPostDbEntityFields.originalAuthorId]: originalPost.authorId as unknown as TUserId,
            [EPostDbEntityFields.postBody]: originalPost.body,
            [EPostDbEntityFields.tags]: {
                [EPrismaQueryFields.connect]: originalPost.tags ?
                    (originalPost.tags as unknown as TDbTags[EPostDbEntityFields.tags])?.map((tag) => ({...tag})) :
                    []
            }
        }
        const [newRepostedPost, repostedOriginalPost] = await this.prismaClient.$transaction([
            this.#rawClient.create({
                [EPrismaQueryFields.data]: {
                    ...repostedPost as unknown as Required<Pick<TPostEntity, EPostDbEntityFields.userId>> & TTagsConnectOrCreate & TPostEntity,
                    ...{
                        [EDbDates.createdAt]: new Date(),
                        [EDbDates.updatedAt]: new Date()
                    }
                }
            }),
            this.#rawClient.update({
                [EPrismaQueryFields.where]: {
                    [EId.id]: postId as string
                },
                [EPrismaQueryFields.data]: {[EPostDbEntityFields.rePosted]: true}
            })
        ])
        return newRepostedPost?.id && repostedOriginalPost?.id === postId ? newRepostedPost.id : undefined
    }
    async getIncludeParameters({keys = [], all = true}: {keys?: EPrismaDbTables[]; all?: boolean}): Promise<Record<string, any>> {
        if(all) {
            return Object.keys(EPrismaDbTables).reduce((acc, dbTable) => (dbTable !== EPrismaDbTables.posts && dbTable !== EPrismaDbTables.feeds ? {...acc, [dbTable]:true} : acc), {})
        }
        return keys.reduce((acc, dbTable) => ({...acc, [dbTable]:true}), {})
    }
    async getSortedPaginationParameters(options: SortedPaginationDTO, forComments = false): Promise<TPrismaSortedPagination> {
        const _default: Partial<{[k in EDbDates]: ESortByOrder.desc}> = !forComments ? {[EDbDates.publishedAt]: ESortByOrder.desc} : {[EDbDates.createdAt]: ESortByOrder.desc}
        const _orderByLikes = options.sort === EPostSortBy.likes ? {
            [EPostSortBy.likes] : {
                [EPrismaQueryFields._count]: ESortByOrder.desc
            },
        } : undefined

        const _orderByComments = options.sort === EPostSortBy.comments ? {
            [EPostSortBy.comments]: {
                [EPrismaQueryFields._count]: ESortByOrder.desc
            },
        } : undefined
        const _orderByDate: typeof _default|undefined = options.sort === EPostSortBy.date ? {
            [!forComments ? EDbDates.publishedAt : EDbDates.createdAt]: ESortByOrder.desc
        } : undefined
        return {
            [EPrismaSortedPaginationFields.skip]: options[EPaginationFields.offset] ?? undefined,
            [EPrismaSortedPaginationFields.take]: options[EPaginationFields.limit] ? options[EPaginationFields.limit] : undefined,
            [EPrismaSortedPaginationFields.orderBy]: _orderByLikes || _orderByComments || _orderByDate || _default
        }
    }
    async getWhereParameters(parameters: Record<string, any> = {}, onlyPublished = true): Promise<TWhereParameters> {
        return {
            [EPostDbEntityFields.postState]: onlyPublished ? EPostState.published : undefined,
            ...parameters,
        }
    }
    async fromJsonBodyTitleFieldRawSearchQuery({search}: {search: string}): Promise<ReturnedPostRDO[]> {
        const _search = `${search.replaceAll('  ', ' ').trim().split(' ').join('|')}:*`
        return await this.prismaClient.$queryRaw`
            SELECT p.*
            FROM posts p
            WHERE
                to_tsvector(body->'title') @@ to_tsquery(${_search}) AND
                p."state" = 'published'
            ORDER BY ts_rank(to_tsvector(body->'title'), to_tsquery(${_search})) DESC
            LIMIT ${this._appConfig.POSTS_SEARCH_LIMIT}
        ;`
    }
}
