import {Inject, Injectable } from '@nestjs/common'
import {AddCommentRDO, AddLikeDTO, AddLikeRDO, AppError, CommentDTO, DeleteCommentDTO, DeleteCommentRDO, DeleteLikeDTO, DeleteLikeRDO, DeletePostDTO, EBlogRouts, PostDTO, RePostDTO, RePostRDO, RePublishPostDateDTO, ReturnedUserRDO, UpdatePostDTO, UpdatePostRDO} from '@shared'
import {ClientProxy} from '@nestjs/microservices'
import {lastValueFrom} from 'rxjs'

@Injectable()
export class BlogActionsProxyService {
    constructor(
        @Inject(EBlogRouts.blog) private readonly blogClient: ClientProxy
    ){}
    async addPost(data: PostDTO): Promise<ReturnedUserRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.post,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async editPost(data: UpdatePostDTO): Promise<UpdatePostRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.updatePost,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async rePublishPost(data: RePublishPostDateDTO): Promise<UpdatePostRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.rePublish,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async deletePost(data: DeletePostDTO): Promise<UpdatePostRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.deletePost,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async repost(data: RePostDTO): Promise<RePostRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.repost,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async addLike(data: AddLikeDTO): Promise<AddLikeRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.like,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async deleteLike(data: DeleteLikeDTO): Promise<DeleteLikeRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.deleteLike,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async addComment(data: CommentDTO): Promise<AddCommentRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.comment,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async deleteComment(data: DeleteCommentDTO): Promise<DeleteCommentRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.deleteComment,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
}
