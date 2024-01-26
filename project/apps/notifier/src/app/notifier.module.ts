import {Module} from '@nestjs/common'
import {NotifierQueue, NotifierQueueSchema, NotifierSubscriber, NotifierSubscriberSchema, RmqModule} from '@shared'
import {NotifierController} from './notifier.controller'
import {NotifierService} from './notifier.service'
import {NotifierMongoModule} from './notifier-mongo.module'
import {MongooseModule} from '@nestjs/mongoose'
import {HandleQueueModule} from './handle-queue-cron.module'
import {ScheduleModule} from '@nestjs/schedule'

@Module({
    imports: [
        RmqModule,
        NotifierMongoModule,
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
        ScheduleModule.forRoot(), HandleQueueModule,

    ],
  controllers: [NotifierController],
  providers: [NotifierService],
})
export class AppModule {}
