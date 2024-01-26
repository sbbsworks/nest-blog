import {Controller, HttpStatus, Get, Param, Patch, Body, Post} from '@nestjs/common'
import {ChangeUserPasswordRDO, ERouteParams, EUsersRouts, ReturnedUserRDO, SubscribeToPostsApiDTO, SubscribedToPostsRDO, TUserId, UserIdDTO, UserUpdatePasswordDTO, jwtConfig as _jwtConfig} from '@shared'
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger'
import {UserProxyService} from './user-proxy.service'
import {AuthorizedUserFullName, AuthorizedUserId, Public} from '../../guard/auth.guard'

@ApiTags(`${EUsersRouts.user} ${'actions'}`)
@Controller(EUsersRouts.user)
export class UserProxyController {
    constructor(
        private readonly userService: UserProxyService,
    ) {}

    @Public()
    @Get(`/:${ERouteParams.userId}`)
    @ApiResponse({status: HttpStatus.NOT_FOUND})
    @ApiParam({ type: String, name: ERouteParams.userId, required: true })
    async findOne(@Param() userId: UserIdDTO): Promise<ReturnedUserRDO> {
        return await this.userService.findOne(userId)
    }

    @Patch(`/${EUsersRouts.updatePassword}`)
    @ApiResponse({status: HttpStatus.NOT_FOUND})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    async updatePassword(@AuthorizedUserId() userId: TUserId, @Body() data: UserUpdatePasswordDTO): Promise<ChangeUserPasswordRDO> {
        return await this.userService.updatePassword({...data, userId})
    }

    @ApiOperation({ summary: 'An authorized user will subscribe to be notified of new posts' })
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    @ApiParam({type: Number, name: ERouteParams.interval, description: 'Interval: <br>"New posts" feed email interval (value in seconds).<br>0 = do not subscribe/unsubscribe'})
    @Post(`/${EUsersRouts.subscribeToNewPostsNotifier}/:${ERouteParams.interval}`)
    async subscribeToNewPostsNotifier(@AuthorizedUserId() userId: TUserId, @AuthorizedUserFullName() fullName: string, @Param() params: SubscribeToPostsApiDTO): Promise<SubscribedToPostsRDO> {
        const {interval} = params
        return await this.userService.subscribeToNewPostsNotifier(userId, fullName, interval)
    }
}
