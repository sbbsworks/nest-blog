import {Controller, HttpStatus, Param, Get, Query} from '@nestjs/common'
import {CommentsPaginationDTO, EBlogRouts, ERouteParams, EUserDTOFields, PostIdDTO, PostKeyphraseDTO, PostTagDTO, PostTypeDTO, ReturnedCommentRDO, ReturnedHydratedCommentsRDO, ReturnedHydratedPostRDO, ReturnedPostRDO, SortedPaginationDTO, TUserId, UserIdDTO, jwtConfig as _jwtConfig} from '@shared'
import {ApiOperation, ApiParam,  ApiResponse, ApiTags} from '@nestjs/swagger'
import {AuthorizedUserId, Public} from '../../guard/auth.guard'
import {BlogInfoProxyService} from './info-proxy.service'

@ApiTags(`${EBlogRouts.blog} ${EBlogRouts.info}`)
@Controller(EBlogRouts.blog)
export class BlogInfoProxyController {
    constructor(
        private readonly infoService: BlogInfoProxyService,
    ) {}

    @Public()
    @Get(`${EBlogRouts.posts}/${EBlogRouts.one}/:${ERouteParams.postId}`)
    @ApiResponse({status: HttpStatus.NOT_FOUND})
    @ApiParam({ type: String, name: ERouteParams.postId, required: true })
    async findOnePost(@Param() postId: PostIdDTO): Promise<ReturnedHydratedPostRDO> {
        return await this.infoService.findOnePost(postId)
    }

    @Public()
    @Get(`${EBlogRouts.posts}`)
    @ApiOperation({ summary: 'Any user will get a list of blog posts. A paginated array of posts. 25 (limit) at once.' })
    async listPosts(@Query() sortedPagination: SortedPaginationDTO): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.listPosts(sortedPagination)
    }

    @Get(`${EBlogRouts.posts}/${EBlogRouts.user}/${EBlogRouts.drafts}`)
    async listUserDrafts(@AuthorizedUserId() userId: TUserId): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.listUserDrafts(userId)
    }

    @Public()
    @Get(`${EBlogRouts.posts}/${EBlogRouts.user}/:${ERouteParams.userId}`)
    async listUserPosts(
        @Param() params: UserIdDTO,
        @Query() sortedPagination: SortedPaginationDTO
    ): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.listUserPosts({...sortedPagination, [EUserDTOFields.userId]: `${params.userId}`})
    }

    @Public()
    @Get(`${EBlogRouts.posts}/${EBlogRouts.type}/:${ERouteParams.postType}`)
    async listPostsByType(@Param() postType: PostTypeDTO): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.listPostsByType(postType)
    }

    @Public()
    @Get(`${EBlogRouts.posts}/${EBlogRouts.tag}/:${ERouteParams.postTag}`)
    async listPostsByTag(@Param() postTag: PostTagDTO): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.listPostsByTag(postTag)
    }

    @Public()
    @Get(`${EBlogRouts.comments}/:${ERouteParams.postId}`)
    async listPostComments(
        @Param() params: PostIdDTO,
        @Query() pagination: CommentsPaginationDTO
    ): Promise<ReturnedHydratedCommentsRDO[]> {
        return await this.infoService.listPostComments({...pagination, postId: params.postId})
    }

    @Public()
    @Get(`${EBlogRouts.posts}/${EBlogRouts.search}/:${ERouteParams.keyphrase}`)
    async searchPosts(@Param() keyphrase: PostKeyphraseDTO): Promise<ReturnedHydratedPostRDO[]> {
        return await this.infoService.searchPosts(keyphrase)
    }
}
