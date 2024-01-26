import {Inject, Injectable } from '@nestjs/common'
import {AppError, CommentsPaginationDTO, EBlogRouts, PostIdDTO, PostKeyphraseDTO, PostTagDTO, PostTypeDTO, ReturnedCommentRDO, ReturnedHydratedCommentsRDO, ReturnedHydratedPostRDO, ReturnedPostRDO, SortedPaginationDTO, TUserId, UserPostsDTO} from '@shared'
import {ClientProxy} from '@nestjs/microservices'
import {lastValueFrom} from 'rxjs'
import {UserProxyService} from '../users-proxy/user-proxy.service'

@Injectable()
export class BlogInfoProxyService {
    constructor(
        @Inject(EBlogRouts.blog) private readonly blogClient: ClientProxy,
        private readonly userProxyService: UserProxyService
    ){}
    async findOnePost(postId: PostIdDTO): Promise<ReturnedHydratedPostRDO> {
        try {
            const post: ReturnedPostRDO = await lastValueFrom(this.blogClient.send(
                EBlogRouts.one,
                postId
            ))
            return (await this.userProxyService.postsHydrator([post]))[0]
        } catch(error) {
            throw new AppError({
                error,
                payload: postId,
            })
        }
    }
    async listPosts(sortedPagination: SortedPaginationDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.posts,
                sortedPagination
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: sortedPagination,
            })
        }
    }
    async listUserDrafts(userId: TUserId): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.drafts,
                userId
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: userId,
            })
        }
    }
    async listUserPosts(data: UserPostsDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.userPosts,
                data
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async listPostsByType(postType: PostTypeDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.type,
                postType
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: postType,
            })
        }
    }
    async listPostsByTag(postTag: PostTagDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.tag,
                postTag
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: postTag,
            })
        }
    }
    async listPostComments(data: CommentsPaginationDTO): Promise<ReturnedHydratedCommentsRDO[]> {
        try {
            return await this.userProxyService.commentsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.comments,
                data
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async searchPosts(keyphrase: PostKeyphraseDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            return await this.userProxyService.postsHydrator(await lastValueFrom(this.blogClient.send(
                EBlogRouts.search,
                keyphrase
            )))
        } catch(error) {
            throw new AppError({
                error,
                payload: keyphrase,
            })
        }
    }
}
