import {Controller, HttpStatus, Post, Body, Put, Param, Delete, HttpCode} from '@nestjs/common'
import {AddCommentRDO, AddLikeRDO, CommentDTO, CommentIdDTO, DeleteCommentRDO, DeleteLikeRDO, DeletePostRDO, EBlogRouts, ERouteParams, EUsersRouts, LikeIdDTO, PostDTO, PostIdDTO, RePostRDO, RePublishPostDateDTO, ReturnedUserRDO, TUserId, UpdatePostDTO, UpdatePostRDO, jwtConfig as _jwtConfig} from '@shared'
import {ApiConsumes,  ApiOperation,  ApiResponse, ApiTags} from '@nestjs/swagger'
import {AuthorizedUserFullName, AuthorizedUserId} from '../../guard/auth.guard'
import {BlogActionsProxyService} from './actions-proxy.service'
import {FileSystemStoredFile, FormDataRequest} from 'nestjs-form-data'

@ApiTags(`${EBlogRouts.blog} ${EBlogRouts.actions}`)
@Controller(EBlogRouts.blog)
export class BlogActionsProxyController {
    constructor(
        private readonly actionsService: BlogActionsProxyService,
    ) {}

    @Post(EBlogRouts.post)
    @ApiConsumes('multipart/form-data')
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    @FormDataRequest({storage: FileSystemStoredFile})
    async addPost(@AuthorizedUserId() userId: TUserId, @AuthorizedUserFullName() fullName: string, @Body() data: PostDTO): Promise<ReturnedUserRDO> {
        return await this.actionsService.addPost({...data, fullName, userId})
    }

    @Put(`${EBlogRouts.post}/:${ERouteParams.postId}`)
    @ApiConsumes('multipart/form-data')
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    @FormDataRequest({storage: FileSystemStoredFile})
    async editPost(@AuthorizedUserId() userId: TUserId, @Body() data: UpdatePostDTO, @Param() params: PostIdDTO): Promise<UpdatePostRDO> {
        return await this.actionsService.editPost({...data, userId, postId: params.postId})
    }

    @Put(`${EBlogRouts.post}/${EBlogRouts.rePublish}/:${ERouteParams.postId}`)
    @ApiOperation({ summary: 'Updates post "published_at" date' })
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    async rePublishPost(@AuthorizedUserId() userId: TUserId, @Body() data: RePublishPostDateDTO, @Param() params: PostIdDTO): Promise<UpdatePostRDO> {
        return await this.actionsService.rePublishPost({...data, postId: params.postId, userId})
    }

    @Delete(`${EBlogRouts.post}/:${ERouteParams.postId}`)
    @HttpCode(HttpStatus.OK)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT})
    async deletePost(@AuthorizedUserId() userId: TUserId, @Param() params: PostIdDTO): Promise<DeletePostRDO> {
        return await this.actionsService.deletePost({postId: params.postId, userId})
    }

    @Post(`${EBlogRouts.post}/${EBlogRouts.repost}/:${ERouteParams.postId}`)
    @ApiOperation({ summary: 'Repost a someone else\'s post' })
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    async repost(@AuthorizedUserId() userId: TUserId, @Param() params: PostIdDTO): Promise<RePostRDO> {
        return await this.actionsService.repost({postId: params.postId, userId})
    }

    @Post(`${EBlogRouts.like}/:${ERouteParams.postId}`)
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    async addLike(@AuthorizedUserId() userId: TUserId, @Param() params: PostIdDTO): Promise<AddLikeRDO> {
        return await this.actionsService.addLike({postId: params.postId, userId})
    }

    @Delete(`${EBlogRouts.like}/:${ERouteParams.likeId}`)
    async deleteLike(@AuthorizedUserId() userId: TUserId, @Param() params: LikeIdDTO): Promise<DeleteLikeRDO> {
        return await this.actionsService.deleteLike({likeId: params.likeId, userId})
    }

    @Post(`${EBlogRouts.comment}/:${ERouteParams.postId}`)
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    async addComment(@AuthorizedUserId() userId: TUserId, @Body() data: CommentDTO, @Param() params: PostIdDTO): Promise<AddCommentRDO> {
        return await this.actionsService.addComment({...data, postId: params.postId, userId})
    }

    @Delete(`${EBlogRouts.comment}/:${ERouteParams.commentId}`)
    async deleteComment(@AuthorizedUserId() userId: TUserId, @Param() params: CommentIdDTO): Promise<DeleteCommentRDO> {
        return await this.actionsService.deleteComment({commentId: params.commentId, userId})
    }

}
