import {Inject, Injectable} from '@nestjs/common'
import {JWTRDO, jwtConfig as _jwtConfig} from '@shared'
import {Response} from 'express'
import {ConfigType} from '@nestjs/config'

@Injectable()
export class CookiesService {
    constructor(
        @Inject(_jwtConfig.KEY)
        private readonly jwtConfig: ConfigType<typeof _jwtConfig>
    ) {}
    async setCookies(tokens: JWTRDO, response: Response): Promise<{result:boolean}> {
        const {token, refreshToken} = tokens
        response.cookie(`${this.jwtConfig.JWT_COOKIES_NAME}`, token, {
            sameSite: true,
            httpOnly: true,
            secure: false,
        })
        response.cookie(`${this.jwtConfig.JWT_REFRESH_COOKIES_NAME}`, refreshToken, {
            sameSite: true,
            httpOnly: true,
            secure: false,
        })
        return {result:true}
    }
}
