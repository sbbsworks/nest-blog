const notifierEnvPath = 'containers/notifier/'
require('dotenv').config({ path: `${notifierEnvPath}/.env` })

import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _notifierConfig = Object.freeze({
    NOTIFIER_INITDB_CONTAINER1: process.env.NOTIFIER_INITDB_CONTAINER1 as string ?? undefined,
    NOTIFIER_INITDB_CONTAINER2: process.env.NOTIFIER_INITDB_CONTAINER2 as string ?? undefined,
    NOTIFIER_INITDB_CONTAINER3: process.env.NOTIFIER_INITDB_CONTAINER3 as string ?? undefined,
    NOTIFIER_DEFAULT_DB_NAME: process.env.NOTIFIER_DEFAULT_DB_NAME as string ?? undefined,
    NOTIFIER_INITDB_ROOT_USERNAME: process.env.NOTIFIER_INITDB_ROOT_USERNAME as string ?? undefined,
    NOTIFIER_INITDB_ROOT_PASSWORD: process.env.NOTIFIER_INITDB_ROOT_PASSWORD as string ?? undefined,
    NOTIFIER_INITDB_PORT: +(process.env.NOTIFIER_INITDB_PORT as string ?? undefined),
    NOTIFIER_SUBSCRIBERS_COLLECTION_NAME: process.env.NOTIFIER_SUBSCRIBERS_COLLECTION_NAME as string ?? undefined,
    NOTIFIER_QUEUE_COLLECTION_NAME: process.env.NOTIFIER_QUEUE_COLLECTION_NAME as string ?? undefined,

    NOTIFIER_SMTP_CONTAINER: process.env.NOTIFIER_SMTP_CONTAINER as string ?? undefined,
    NOTIFIER_SMTP_HOSTNAME: process.env.NOTIFIER_SMTP_HOSTNAME as string ?? undefined,
    NOTIFIER_AUTHENTICATION_USERNAME: process.env.NOTIFIER_AUTHENTICATION_USERNAME as string ?? undefined,
    NOTIFIER_AUTHENTICATION_PASSWORD: process.env.NOTIFIER_AUTHENTICATION_PASSWORD as string ?? undefined,
    NOTIFIER_SMTP_PORT: +(process.env.NOTIFIER_SMTP_PORT as string ?? undefined),
    NOTIFIER_SERVER_PORT: +(process.env.NOTIFIER_SERVER_PORT as string ?? undefined),
    NOTIFIER_MANAGEMENT_SERVER_PORT: +(process.env.NOTIFIER_MANAGEMENT_SERVER_PORT as string ?? undefined),
})

type TConfig = {[k: string] : string|number}
const notifierConfig = registerAs('notifierConfig', (): TConfig => _notifierConfig)

validateConfig(notifierConfig(), notifierEnvPath)

export {notifierConfig}
