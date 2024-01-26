import { IRepository } from "./abstract-repository";
import { DbEntity, EDbDates, EId} from "../entities/db.entity";
import { TPostEntity, TPrismaClientPostsTable, TTagsConnectOrCreate } from "../services/posts-prisma-repository.service";
import { EPostSortBy, TPostId } from "@shared";
import { TLikeEntity, TPrismaClientLikesTable } from "../services/likes-prisma-repository.service";
import { TLikeId } from "../dtos/like.dto";
import { TCommentEntity, TPrismaClientCommentsTable } from "../services/comments-prisma-repository.service";
import { TCommentId } from "../dtos/comment.dto";
import { TFeedId } from "../dtos/feed.dto";
import { TFeedEntity, TPrismaClientFeedsTable } from "../services/feeds-prisma-repository.service";

export type TWhereParameters = Record<string, any>

export enum EPrismaQueryFields {
    select = 'select',
    _count = '_count',
    some = 'some',
    is = 'is',
    name = 'name',
    where = 'where',
    data = 'data',
    create = 'create',
    connect = 'connect',
    connectOrCreate = 'connectOrCreate',
    disconnect = 'disconnect',
    set = 'set',
    not = 'NOT'
}
export enum ESortByOrder {
    desc = 'desc',
    asc = 'asc'
}
export enum EPrismaSortedPaginationFields {
    take = 'take',
    skip = 'skip',
    orderBy = 'orderBy',
}
export type TPrismaSortedPagination = {
    [EPrismaSortedPaginationFields.skip]: number|undefined;
    [EPrismaSortedPaginationFields.take]: number|undefined;
    [EPrismaSortedPaginationFields.orderBy]: (Partial<{[k in EPostSortBy]: Partial<Record<EPostSortBy|EPrismaQueryFields, ESortByOrder>>}>|{[EDbDates.publishedAt]: ESortByOrder}) | undefined,
}
export type TPrismaClientModel = TPrismaClientPostsTable|TPrismaClientLikesTable|TPrismaClientCommentsTable|TPrismaClientFeedsTable

export abstract class ABlogPrismaRepository<T extends
    (DbEntity<TPostId> & TPostEntity) |
    (DbEntity<TLikeId> & TLikeEntity) |
    (DbEntity<TCommentId> & TCommentEntity) |
    (DbEntity<TFeedId> & TFeedEntity)
> implements IRepository<T>{
    protected readonly prismaClientModel: any

    constructor(
        protected readonly _prismaClientModel: TPrismaClientModel
    ) {
        this.prismaClientModel = _prismaClientModel
    }
    async findAll({options, include = {}, where}: {
        options?: TPrismaSortedPagination;
        include?: Record<string, any>;
        where?:TWhereParameters
    }): Promise<any[]> {
        return await this.prismaClientModel.findMany({
            ...options,
            include: {...include},
            where: {...where}
        })
    }
    async findOne(id: T[EId.id], include: Record<string, any> = {}): Promise<T & Pick<T, EId.id>|undefined> {
        const queryParams = {
            where: {
                [`${EId.id}`]: id as TPostId,
            },
            include: {...include}
        }
        const result = await this.prismaClientModel.findUnique(queryParams)
        return result ? result as unknown as T : undefined
    }
    async save(item:
            TPostEntity & TTagsConnectOrCreate & T |
            TLikeEntity & T |
            TCommentEntity & T |
            TFeedEntity & T
        ): Promise<TPostId|TLikeId> {
        const {id: newItemId} = await this.prismaClientModel.create({
            data: {...item, ...{[EDbDates.createdAt]: new Date(), [EDbDates.updatedAt]: new Date()}}
        })
        return newItemId
    }
    async update(id: T[EId.id], item: T, where: TWhereParameters = {}): Promise<boolean> {
        const _item = {...item, [EDbDates.updatedAt]: new Date()} as Omit<T, EDbDates.createdAt> & {[EDbDates.updatedAt]: Date}
            const updated = await this.prismaClientModel.update({
                where: {
                    id: id as string,
                    ...where
                },
                data: _item
            })
            return updated.id === id
    }
    async delete(id: T[EId.id], where: TWhereParameters = {}): Promise<boolean> {
        const deleted = await this.prismaClientModel.delete({
            where: {
                id,
                ...where
            },
        })
        return deleted.id === id
    }
}
