import {NestFactory} from '@nestjs/core'
import {AppModule} from './app/notifier.module'
import {RmqService, envConfig, notifierConfig, rmqConfig} from '@shared'

const _envConfig = envConfig()
const _rmqConfig = rmqConfig()
const _notifierConfig = notifierConfig()

;(async function() {
    try {
        const app = await NestFactory.create(AppModule);
        const rmqService = app.get<RmqService>(RmqService)
        app.connectMicroservice(rmqService.getOptions(`${_rmqConfig.NOTIFIER_RMQ_NAME}`))
        await app.startAllMicroservices()

        /* do not delete - cron */
        await app.listen(+_envConfig.NOTIFIER_API_PORT)
        /* do not delete - cron */

        setTimeout(() => {
            console.info('')
            console.info(`Notifier is running on: amqp://${_rmqConfig.RABBIT_MQ_CONTAINER_NAME}:${_rmqConfig.RABBIT_MQ_PORT}`)
            console.info(`Notifier smtp server is running on: {host}:${_notifierConfig.NOTIFIER_SMTP_PORT}`)
            console.info(`Notifier smtp web server is running on: {protocol}://{host}:${_notifierConfig.NOTIFIER_SERVER_PORT}`)
            console.info(`Notifier smtp management server is running on: {protocol}://{host}:${_notifierConfig.NOTIFIER_MANAGEMENT_SERVER_PORT}`)
            console.info('')
        }, 2000)

    } catch (error) {
        console.error((error as Error).message)
        process.exit(+_notifierConfig.NOTIFIER_SMTP_PORT)
    }
})()
