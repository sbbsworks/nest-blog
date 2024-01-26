const mongoUsersEnvPath = 'containers/users/'
require('dotenv').config({ path: `${mongoUsersEnvPath}/.env` })

import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _mongoUsersConfig = Object.freeze({
    MONGO_INITDB_CONTAINER: process.env.MONGO_INITDB_CONTAINER as string ?? undefined,
    MONGO_USERS_DEFAULT_DB_NAME: process.env.MONGO_USERS_DEFAULT_DB_NAME as string ?? undefined,
    MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME as string ?? undefined,
    MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD as string ?? undefined,
    MONGO_INITDB_PORT: +(process.env.MONGO_INITDB_PORT as string ?? undefined),
})

type TConfig = {[k: string] : string|number}
const mongoUsersConfig = registerAs('mongoUsersConfig', (): TConfig => _mongoUsersConfig)

validateConfig(mongoUsersConfig(), mongoUsersEnvPath)

export {mongoUsersConfig}
