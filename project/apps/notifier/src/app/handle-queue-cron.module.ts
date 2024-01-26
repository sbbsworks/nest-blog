import {Module} from '@nestjs/common'
import {HandleQueueService} from './handle-queue-cron.service'
import {MongooseModule} from '@nestjs/mongoose'
import {NotifierQueue, NotifierQueueSchema, NotifierSubscriber, NotifierSubscriberSchema, envConfig, notifierConfig} from '@shared'
import {MailerModule} from '@nestjs-modules/mailer'

const _notifierConfig = notifierConfig()
const _envConfig = envConfig()

const MailerSMTPConfig = {
    transport: `smtp://${_notifierConfig.NOTIFIER_AUTHENTICATION_USERNAME}:${_notifierConfig.NOTIFIER_AUTHENTICATION_PASSWORD}@${_notifierConfig.NOTIFIER_SMTP_CONTAINER}:${_notifierConfig.NOTIFIER_SMTP_PORT}`,
    defaults: {
        from: `"${_envConfig.API_PREFIX}" <${_envConfig.API_PREFIX}@noreply.noreply>`,
    }
}

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: NotifierSubscriber.name,
                schema: NotifierSubscriberSchema,
            },
            {
                name: NotifierQueue.name,
                schema: NotifierQueueSchema,
            },
        ]),
        MailerModule.forRootAsync({
            useFactory: () => MailerSMTPConfig,
        }),
    ],
    providers: [HandleQueueService],
})
export class HandleQueueModule {}
