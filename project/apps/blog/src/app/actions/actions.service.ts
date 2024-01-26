import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common'
import {ClientProxy, RpcException} from '@nestjs/microservices'
import {AddCommentRDO, AddLikeDTO, AddLikeRDO, AddPostRDO, AppRpcResponse, CommentDTO, CommentsPrismaRepositoryService, DeleteCommentDTO, DeleteCommentRDO, DeleteLikeDTO, DeleteLikeRDO, DeletePostDTO, DeletePostRDO, EId, ELoggerMessages, ENotifierQueueFields, EPostDTOFields, EPostDbEntityFields, EPostState, ERmqEvents, EUserDTOFields, LikesPrismaRepositoryService, PostDTO, PostsPrismaRepositoryService, RePostDTO, RePostRDO, RePublishPostDateDTO, ReturnedPostRDO, TCommentId, TLikeId, TPostEntity, TPostId, TTagsConnectOrCreate, UpdatePostDTO, UpdatePostRDO, rmqConfig} from '@shared'
import {lastValueFrom} from 'rxjs'

const _rmqConfig = rmqConfig()

@Injectable()
export class ActionsService {
    constructor(
        private readonly postsPrisma: PostsPrismaRepositoryService,
        private readonly likesPrisma: LikesPrismaRepositoryService,
        private readonly commentsPrisma: CommentsPrismaRepositoryService,
        @Inject(`${rmqConfig().NOTIFIER_RMQ_NAME}`)
        private readonly notifierRqmService: ClientProxy,
        private readonly appRpcResponse: AppRpcResponse,
        ){}
    async addPostToNotifierQueue(data: PostDTO, newPostId:TPostId): Promise<boolean> {
        return await new Promise(async (resolve, reject) => {
            const rmqIsDown = setTimeout(() => {
                reject(new HttpException(ELoggerMessages.coudNotSubscribe, HttpStatus.GATEWAY_TIMEOUT))
            }, +_rmqConfig.WAIT_FOR_RMQ_CONNECTION_TIMEOUT)
            const addedToQueue = await lastValueFrom(this.notifierRqmService.send(ERmqEvents.addPostToQueue, {
                [ENotifierQueueFields.postId]: newPostId,
                [ENotifierQueueFields.postType]: data[EPostDTOFields.postType],
                [ENotifierQueueFields.authorId]: data[EUserDTOFields.userId],
                [ENotifierQueueFields.authorName]: data[EUserDTOFields.fullName],
             })) as boolean
            clearTimeout(rmqIsDown)
            resolve(addedToQueue)
        })
    }
    async addPost(data: PostDTO): Promise<AddPostRDO> {
        try {
            const _post = await this.postsPrisma.preparePost(data, true)
            const callback = async (newPostId: TPostId) => await this.addPostToNotifierQueue(data, newPostId)
            const {newPostId, addedToQueue} = await this.postsPrisma.addPostWithTransaction(_post as Required<Pick<TPostEntity, EPostDbEntityFields.userId>> & TTagsConnectOrCreate & TPostEntity, callback)
            return {[EId.id]: newPostId, notifier: addedToQueue ? ELoggerMessages.addedToQueue :  ELoggerMessages.willAddToQueue}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotAddPost,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async editPost(data: UpdatePostDTO): Promise<UpdatePostRDO> {
        try {
            const{postId:id} = data
            const _post = await this.postsPrisma.preparePost(data)
            const _where = await this.postsPrisma.getWhereParameters({[EPostDbEntityFields.userId]: `${data.userId}`}, false)
            const updated = await this.postsPrisma.update(id, _post, _where)
            return {result: updated}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.postWasNotUpdated,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async rePublishPost(data: RePublishPostDateDTO): Promise<UpdatePostRDO> {
        try {
            const{postId:id} = data
            const _post = await this.postsPrisma.prepareRepublishedPost(data) as TPostEntity
            const _where = await this.postsPrisma.getWhereParameters({[EPostDbEntityFields.userId]: `${data.userId}`}, false)
            const updated = await this.postsPrisma.update(id, _post, _where)
            return {result: updated}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.postPublishingDateWasNotUpdated,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async deletePost(data: DeletePostDTO): Promise<DeletePostRDO> {
        try {
            const{postId:id} = data
            const _where = await this.postsPrisma.getWhereParameters({[EPostDbEntityFields.userId]: `${data.userId}`}, false)
            const deleted = await this.postsPrisma.delete(id, _where)
            return {result: deleted}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotDeletePost,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async repost(data: RePostDTO): Promise<RePostRDO> {
        try {
            const{postId:id} = data
            const newRepostedPostId = await this.postsPrisma.repost(id, `${data.userId}`)
            if(!newRepostedPostId) {
                throw new HttpException(ELoggerMessages.couldNotRepostPost, HttpStatus.BAD_REQUEST)
            }
            return {[EId.id]: newRepostedPostId as string}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotRepostPost,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async addLike(data: AddLikeDTO): Promise<AddLikeRDO> {
        try {
            const{postId:id} = data
            const _include = await this.postsPrisma.getIncludeParameters({})
            const _post = await this.postsPrisma.findOne(id, _include)
            if(
                !_post ||
                (_post as unknown as ReturnedPostRDO)[EPostDbEntityFields.postState] !== EPostState.published
            ) {
                throw new HttpException(ELoggerMessages.couldNotAddLike, HttpStatus.NOT_FOUND)
            }
            if(
                (_post as unknown as ReturnedPostRDO)[EPostDbEntityFields.likes].find((like) => `${like.authorId}` === `${data.userId}`)
            ) {
                throw new HttpException(ELoggerMessages.alreadyExists, HttpStatus.CONFLICT)
            }
            const _like = await this.likesPrisma.prepareLike(id, data.userId)
            const newLikeId = await this.likesPrisma.save(_like) as TLikeId
            return {[EId.id]: newLikeId}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotAddLike,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async deleteLike(data: DeleteLikeDTO): Promise<DeleteLikeRDO> {
        try {
            const{likeId:id} = data
            const _where = await this.postsPrisma.getWhereParameters({[EPostDbEntityFields.userId]: `${data.userId}`}, false)
            const deleted = await this.likesPrisma.delete(id, _where)
            return {result: deleted}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotDeleteLike,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async addComment(data: CommentDTO): Promise<AddCommentRDO> {
        try {
            const{postId:id} = data
            const _post = await this.postsPrisma.findOne(id)
            if(!_post) {
                throw new HttpException(ELoggerMessages.couldNotAddComment, HttpStatus.NOT_FOUND)
            }
            const{text:comment} = data
            const _comment = await this.commentsPrisma.prepareComment(comment, id, data.userId)
            const newCommentId = await this.commentsPrisma.save(_comment) as TCommentId
            return {[EId.id]: newCommentId}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotAddComment,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async deleteComment(data: DeleteCommentDTO): Promise<DeleteCommentRDO> {
        try {
            const{commentId:id} = data
            const _where = await this.postsPrisma.getWhereParameters({[EPostDbEntityFields.userId]: `${data.userId}`}, false)
            const deleted = await this.commentsPrisma.delete(id, _where)
            return {result: deleted}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.couldNotDeleteComment,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
}
