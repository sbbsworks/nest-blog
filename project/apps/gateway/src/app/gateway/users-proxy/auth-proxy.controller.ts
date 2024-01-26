import {Body, Controller, HttpCode, HttpStatus, Inject, Post, Res} from '@nestjs/common'
import {AppError, AuthUserRDO, ELoggerMessages, EUserDTOFields, EUsersRouts, UserDTO, UserSignInDTO, jwtConfig as _jwtConfig} from '@shared'
import {ApiConsumes, ApiResponse, ApiTags} from '@nestjs/swagger'
import {FileSystemStoredFile, FormDataRequest} from 'nestjs-form-data'
import {AuthProxyService} from './auth-proxy.service'
import {CookiesService} from '../../cookies/cookies.service'
import {Response} from 'express'
import {ConfigType} from '@nestjs/config'
import {Public} from '../../guard/auth.guard'

@ApiTags(`${EUsersRouts.user} ${EUsersRouts.auth}`)
@Controller(`${EUsersRouts.user}/${EUsersRouts.auth}`)
export class AuthProxyController {
    constructor(
        private readonly proxyService: AuthProxyService,
        private readonly cookiesService: CookiesService,
        @Inject(_jwtConfig.KEY)
        private readonly jwtConfig: ConfigType<typeof _jwtConfig>
    ) {}

    @Public()
    @Post(EUsersRouts.signup)
    @ApiResponse({status: HttpStatus.CONFLICT})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    @ApiConsumes('multipart/form-data')
    @FormDataRequest({storage: FileSystemStoredFile})
    async signup(@Body() data: UserDTO) {
        return await this.proxyService.signup(data)
    }

    @Public()
    @Post(EUsersRouts.signin)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.UNAUTHORIZED})
    async signin(@Res({passthrough: true}) response: Response, @Body() data: UserSignInDTO): Promise<AuthUserRDO> {
        try {
            response.clearCookie(`${this.jwtConfig.JWT_COOKIES_NAME}`)
            response.clearCookie(`${this.jwtConfig.JWT_REFRESH_COOKIES_NAME}`)
            const tokens = await this.proxyService.signin(data)
            const {result} = await this.cookiesService.setCookies(tokens, response)
            return {result}
        } catch(error) {
            throw new AppError({
                error,
                responseMessage: ELoggerMessages.couldNotAuthorize,
                payload: data[EUserDTOFields.email],
            })
        }
    }
}
