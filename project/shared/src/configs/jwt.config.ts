const jwtEnvPath = 'apps/gateway/src/app/jwt'
require('dotenv').config({ path: `${jwtEnvPath}/.env` })

import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _jwtConfig = Object.freeze({
    JWT_ISSUER: process.env.JWT_ISSUER as string ?? undefined,
    JWT_TOKEN: process.env.JWT_TOKEN as string ?? undefined,
    JWT_TOKEN_TTL: +(process.env.JWT_TOKEN_TTL as string ?? undefined),
    JWT_REFRESH_TOKEN_TTL: +(process.env.JWT_REFRESH_TOKEN_TTL as string ?? undefined),
    JWT_COOKIES_NAME: process.env.JWT_COOKIES_NAME as string ?? undefined,
    JWT_REFRESH_COOKIES_NAME: process.env.JWT_REFRESH_COOKIES_NAME as string ?? undefined,
})

type TConfig = {[k: string] : string|number}
const jwtConfig = registerAs('jwtConfig', (): TConfig => _jwtConfig)
validateConfig(jwtConfig(), jwtEnvPath)

export {jwtConfig}
