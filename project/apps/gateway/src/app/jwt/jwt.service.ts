import {Inject, Injectable} from '@nestjs/common'
import {JWTRDO, jwtConfig as _jwtConfig} from '@shared'
import {JwtService as _JwtService} from '@nestjs/jwt'
import {ConfigType} from '@nestjs/config'

@Injectable()
export class JwtService {
    #token: string;
    #refreshToken: string;

    constructor(
        private readonly jwtService: _JwtService,
        @Inject(_jwtConfig.KEY)
        private readonly jwtConfig: ConfigType<typeof _jwtConfig>,
    ){
        this.#token = `${this.jwtConfig.JWT_TOKEN}`
        this.#refreshToken = `${(this.jwtConfig.JWT_TOKEN as string).split('').reverse().join('')}${this.jwtConfig.JWT_TOKEN}`.split('').reverse().join('')
    }
    async issue(userId: string, payload: Record<string, any> = {}): Promise<JWTRDO> {
        const [token, refreshToken] = await Promise.all([
            this.#issue(`${userId}`, +this.jwtConfig.JWT_TOKEN_TTL, payload),
            this.#issue(`${userId}`, +this.jwtConfig.JWT_REFRESH_TOKEN_TTL, payload, true),
        ])
        return {token, refreshToken}
    }
    async #issue(userId: string, expiresIn: number, payload: Record<string, any>, refresh: boolean = false) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload
            },
            {
                issuer: this.jwtConfig.JWT_ISSUER as string,
                secret: refresh ? this.#refreshToken : this.#token,
                expiresIn,
            }
        )
    }
    async validate(token: string, refresh: boolean = false): Promise<object|undefined> {
        try {
            const verified = await this.jwtService.verifyAsync(token, {
                secret: refresh ? this.#refreshToken : this.#token,
            })
            return verified
        } catch(er) {
            return undefined
        }
    }
}
