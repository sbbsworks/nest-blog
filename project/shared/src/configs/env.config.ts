import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _envConfig = Object.freeze({
    API_PREFIX: process.env.API_PREFIX as string ?? undefined,
    GATEWAY_API_PORT: +(process.env.GATEWAY_API_PORT as string ?? undefined),
    USERS_API_PORT: +(process.env.USERS_API_PORT as string ?? undefined),
    BLOG_API_PORT: +(process.env.BLOG_API_PORT as string ?? undefined),
    NOTIFIER_API_PORT: +(process.env.NOTIFIER_API_PORT as string ?? undefined),

    API_DOCS_PATH: process.env.API_DOCS_PATH as string ?? undefined,
    API_DOCS_GATEWAY_TITLE: process.env.API_DOCS_GATEWAY_TITLE as string ?? undefined,
    API_DOCS_GATEWAY_DESCRIPTION: process.env.API_DOCS_GATEWAY_DESCRIPTION as string ?? undefined,
    API_DOCS_USER_TITLE: process.env.API_DOCS_USER_TITLE as string ?? undefined,
    API_DOCS_USER_DESCRIPTION: process.env.API_DOCS_USER_DESCRIPTION as string ?? undefined,
    API_DOCS_BLOG_TITLE: process.env.API_DOCS_BLOG_TITLE as string ?? undefined,
    API_DOCS_BLOG_DESCRIPTION: process.env.API_DOCS_BLOG_DESCRIPTION as string ?? undefined,
    API_DOCS_NOTIFIER_TITLE: process.env.API_DOCS_NOTIFIER_TITLE as string ?? undefined,
    API_DOCS_NOTIFIER_DESCRIPTION: process.env.API_DOCS_NOTIFIER_DESCRIPTION as string ?? undefined,
})

type TConfig = {[k: string] : string|number}
const envConfig = registerAs('envConfig', (): TConfig => _envConfig)

validateConfig(envConfig())

export {envConfig}
