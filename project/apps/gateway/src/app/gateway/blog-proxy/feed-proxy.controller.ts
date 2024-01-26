import {Controller, Delete, Get, HttpStatus, Param, Post, Query} from '@nestjs/common'
import {AddFeedRDO, DeleteFeedRDO, EBlogRouts, ERouteParams, EUserDTOFields, ReturnedHydratedPostRDO, SortedPaginationDTO, TUserId, UserIdDTO, jwtConfig as _jwtConfig} from '@shared'
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger'
import {AuthorizedUserId} from '../../guard/auth.guard'
import {BlogFeedProxyService} from './feed-proxy.service'


@ApiTags(`${EBlogRouts.blog} ${EBlogRouts.feed}`)
@Controller(`${EBlogRouts.blog}/${EBlogRouts.feed}`)
export class BlogFeedProxyController {
    constructor(
        private readonly feedService: BlogFeedProxyService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'An authorized user will get his blog feed. A paginated array of posts. 25 (limit) at once.' })
    async getUserFeed(@AuthorizedUserId() ownerId: TUserId, @Query() sortedPagination: SortedPaginationDTO): Promise<ReturnedHydratedPostRDO[]> {
        return await this.feedService.getUserFeed({...sortedPagination, ownerId})
    }

    @Post(`/:${ERouteParams.userId}`)
    @ApiOperation({ summary: 'An authorized user will subscribe to other user\'s posts to include to his feed.' })
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    @ApiResponse({status: HttpStatus.NO_CONTENT})
    @ApiResponse({status: HttpStatus.BAD_REQUEST})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    @ApiResponse({status: HttpStatus.CONFLICT})
    async subscribe(@AuthorizedUserId() ownerId: TUserId, @Param() params: UserIdDTO): Promise<AddFeedRDO> {
        return await this.feedService.subscribe({ownerId, donorId: params[EUserDTOFields.userId]})
    }

    @Delete(`/:${ERouteParams.userId}`)
    @ApiOperation({ summary: 'An authorized user will unsubscribe from other user\'s posts.' })
    async unsubscribe(@AuthorizedUserId() ownerId: TUserId, @Param() params: UserIdDTO): Promise<DeleteFeedRDO> {
        return await this.feedService.unsubscribe({ownerId, donorId: params[EUserDTOFields.userId]})
    }
}
