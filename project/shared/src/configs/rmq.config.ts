const rmqEnvPath = 'containers/rmq'
import {expand} from 'dotenv-expand'
expand(require('dotenv').config({ path: `${rmqEnvPath}/.env` }))

import {registerAs} from '@nestjs/config'
import { validateConfig } from '../lib/config.validator'

const _rmqConfig = Object.freeze({
    RABBIT_MQ_PORT: +(process.env.RABBIT_MQ_PORT as string ?? undefined),
    RABBIT_MQ_CONTAINER_NAME: process.env.RABBIT_MQ_CONTAINER_NAME as string ?? undefined,
    RABBIT_MQ_URI: process.env.RABBIT_MQ_URI as string ?? undefined,
    RABBIT_MQ_NOTIFIER_QUEUE: process.env.RABBIT_MQ_NOTIFIER_QUEUE as string ?? undefined,
    NOTIFIER_RMQ_NAME: process.env.NOTIFIER_RMQ_NAME as string ?? undefined,
    WAIT_FOR_RMQ_CONNECTION_TIMEOUT: +(process.env.WAIT_FOR_RMQ_CONNECTION_TIMEOUT as string ?? undefined),
})

export type TConfig = {[k: string] : string|number}
const rmqConfig = registerAs('rmqConfig', (): TConfig => _rmqConfig)
validateConfig(rmqConfig(), rmqEnvPath)

export {rmqConfig}
