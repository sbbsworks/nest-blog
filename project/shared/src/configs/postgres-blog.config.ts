const postgresBlogEnvPath = 'containers/blog/'
import {expand} from 'dotenv-expand'
expand(require('dotenv').config({ path: `${postgresBlogEnvPath}/.env` }))

import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _postgresBlogConfig = Object.freeze({
    POSTGRES_INITDB_CONTAINER: process.env.POSTGRES_INITDB_CONTAINER as string ?? undefined,
    POSTGRES_BLOG_DEFAULT_DB_NAME: process.env.POSTGRES_BLOG_DEFAULT_DB_NAME as string ?? undefined,
    POSTGRES_INITDB_ROOT_USERNAME: process.env.POSTGRES_INITDB_ROOT_USERNAME as string ?? undefined,
    POSTGRES_INITDB_ROOT_PASSWORD: process.env.POSTGRES_INITDB_ROOT_PASSWORD as string ?? undefined,
    POSTGRES_INITDB_PORT: +(process.env.POSTGRES_INITDB_PORT as string ?? undefined),
    POSTGRESDB_URL: process.env.POSTGRESDB_URL as string ?? undefined,
})

type TConfig = {[k: string] : string|number}
const postgresBlogConfig = registerAs('postgresBlogConfig', (): TConfig => _postgresBlogConfig)

validateConfig(postgresBlogConfig(), postgresBlogEnvPath)

export {postgresBlogConfig}
