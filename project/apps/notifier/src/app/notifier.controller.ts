import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {NotifierService} from './notifier.service';
import {ENotifierSubscriberFields, ERmqEvents, NotifierQueueDTO, NotifierSubscriberDTO, RmqService} from '@shared';
import {Controller, Logger, UsePipes, ValidationPipe} from '@nestjs/common';

@Controller('/')
export class NotifierController {
    constructor(
        private readonly notifierService: NotifierService,
        private readonly rmqService: RmqService,
    ){}

    @UsePipes(new ValidationPipe({
        transform: false,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        disableErrorMessages: true,
        exceptionFactory: (errors) => {
            (new Logger(NotifierController.name)).error(errors)
        }
    }))
    @EventPattern(ERmqEvents.subscribeToPosts)
    async subscribeUserToPosts(@Payload() data: NotifierSubscriberDTO, @Ctx() context: RmqContext) {
        const subscribed = await this.notifierService.subscribeUserToPosts(data)
        if(subscribed) {
            this.rmqService.acknowledge(context)
        }
        const __interval = +data[ENotifierSubscriberFields.interval]
        return {result: subscribed ? (__interval ? 'subscribed': 'unsubscribed') : (__interval ? 'unsubscribed': 'will be unsubscribed')}
    }

    @UsePipes(new ValidationPipe({
        transform: false,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        disableErrorMessages: true,
        exceptionFactory: (errors) => {
            console.log(errors);
            (new Logger(NotifierController.name)).error(errors)
        }
    }))
    @EventPattern(ERmqEvents.addPostToQueue)
    async addPostToQueue(@Payload() data: NotifierQueueDTO, @Ctx() context: RmqContext) {
        const added = await this.notifierService.addPostToQueue(data)
        if(added) {
            this.rmqService.acknowledge(context)
        }
        return added
    }
}
