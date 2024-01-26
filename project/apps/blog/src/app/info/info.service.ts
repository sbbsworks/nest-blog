import {HttpException, HttpStatus, Injectable} from '@nestjs/common'
import {RpcException} from '@nestjs/microservices'
import {AppRpcResponse, CommentsPaginationDTO, CommentsPrismaRepositoryService, ECommentDbEntityFields, ELoggerMessages, EPostDbEntityFields, EPostState, EPrismaDbTables, EPrismaQueryFields, PostIdDTO, PostKeyphraseDTO, PostTagDTO, PostTypeDTO, PostsPrismaRepositoryService, ReturnedCommentRDO, ReturnedPostRDO, SortedPaginationDTO, TUserId, UserPostsDTO } from '@shared'

@Injectable()
export class InfoService {
    constructor(
        private readonly postsPrisma: PostsPrismaRepositoryService,
        private readonly commentsPrisma: CommentsPrismaRepositoryService,
        private readonly appRpcResponse: AppRpcResponse,
    ){}
    async findOnePost(postId: PostIdDTO): Promise<ReturnedPostRDO> {
        try {
            const {postId:id} = postId
            const _include = await this.postsPrisma.getIncludeParameters({})
            const result = await this.postsPrisma.findOne(id, _include)
            if(!result) {
                throw new HttpException(ELoggerMessages.notFound, HttpStatus.NOT_FOUND)
            }
            return result as unknown as ReturnedPostRDO
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listPosts(sortedPagination: SortedPaginationDTO): Promise<ReturnedPostRDO[]> {
        try {
            const _includeParameters = await this.postsPrisma.getIncludeParameters({})
            const _sortedPaginationParameters = await this.postsPrisma.getSortedPaginationParameters(sortedPagination)
            const _whereParameters = await this.postsPrisma.getWhereParameters()
            return await this.postsPrisma.findAll({
                options: _sortedPaginationParameters,
                include: _includeParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listUserPosts(data: UserPostsDTO): Promise<ReturnedPostRDO[]> {
        try {
            const {userId:id} = data
            const _includeParameters = await this.postsPrisma.getIncludeParameters({})
            const _sortedPaginationParameters = await this.postsPrisma.getSortedPaginationParameters(data)
            const _whereParameters = await this.postsPrisma.getWhereParameters({
                [EPostDbEntityFields.userId]: id
            })
            return await this.postsPrisma.findAll({
                options: _sortedPaginationParameters,
                include: _includeParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listUserDrafts(userId: TUserId): Promise<ReturnedPostRDO[]> {
        try {
            const _includeParameters = await this.postsPrisma.getIncludeParameters({})
            const _whereParameters = await this.postsPrisma.getWhereParameters({
                [EPostDbEntityFields.userId]: `${userId}`,
                [EPostDbEntityFields.postState]: EPostState.draft
            }, false)
            return await this.postsPrisma.findAll({
                include: _includeParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listPostsByType(postType: PostTypeDTO): Promise<ReturnedPostRDO[]> {
        try {
            const{postType:type} = postType
            const _includeParameters = await this.postsPrisma.getIncludeParameters({})
            const _whereParameters = await this.postsPrisma.getWhereParameters({
                [EPostDbEntityFields.postType]: type
            })
            return await this.postsPrisma.findAll({
                include: _includeParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listPostsByTag(postTag: PostTagDTO): Promise<ReturnedPostRDO[]> {
        try {
            const{postTag:tag} = postTag
            const _includeParameters = await this.postsPrisma.getIncludeParameters({})
            const _whereParameters = await this.postsPrisma.getWhereParameters({
                [EPostDbEntityFields.tags]: {
                    [EPrismaQueryFields.some]: {
                        [EPrismaQueryFields.name]: tag,
                    },
                },
            })
            return await this.postsPrisma.findAll({
                include: _includeParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async listPostComments(data: CommentsPaginationDTO): Promise<ReturnedCommentRDO[]> {
        try {
            const {postId:id} = data
            const _sortedPaginationParameters = await this.postsPrisma.getSortedPaginationParameters(data, true)
            const _whereParameters = await this.postsPrisma.getWhereParameters({
                [ECommentDbEntityFields.postId]: id,
                [EPrismaDbTables.posts]: {[EPrismaQueryFields.is]: {
                    [EPostDbEntityFields.postState]: EPostState.published
                }
                },
            }, false)
            return await this.commentsPrisma.findAll({
                options: _sortedPaginationParameters,
                where: _whereParameters,
            })
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async searchPosts(keyphrase: PostKeyphraseDTO): Promise<ReturnedPostRDO[]> {
        try {
            const{keyphrase:text} = keyphrase
            return await this.postsPrisma.fromJsonBodyTitleFieldRawSearchQuery({search: text})
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
}
