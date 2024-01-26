import {Injectable, Logger} from '@nestjs/common'
import {ENotifierQueueFields, ENotifierSubscriberFields, NotifierQueue, NotifierQueueDTO, NotifierSubscriber, NotifierSubscriberDTO} from '@shared'
import {InjectModel} from '@nestjs/mongoose'
import {Model} from 'mongoose'

const secondsToMillisecondsMultiplier = 1000

@Injectable()
export class NotifierService {
    private readonly logger = new Logger(NotifierService.name)

    constructor(
        @InjectModel(NotifierSubscriber.name) private readonly subscriberModel: Model<NotifierSubscriber>,
        @InjectModel(NotifierQueue.name) private readonly queueModel: Model<NotifierQueue>
    ) {}
    async #sanitizeInterval(interval: any): Promise<number> {
        if(isNaN(interval)) {
            return 0
        }
        return +interval > 0 && +interval < 1 ? 1 * secondsToMillisecondsMultiplier : +interval * secondsToMillisecondsMultiplier
    }
    async subscribeUserToPosts(data: NotifierSubscriberDTO): Promise<boolean> {
        const interval = await this.#sanitizeInterval(data.interval)
        try {
            await this.subscriberModel.findOneAndUpdate(
                {[ENotifierSubscriberFields.email]: data[ENotifierSubscriberFields.email],},
                {...data, ...{[ENotifierSubscriberFields.interval]: interval}},
                {runValidators: true, context: 'query', new: true, upsert: true},
            )
            interval ?
                this.logger.debug(`Subscribed ${data[ENotifierSubscriberFields.email]} with ${interval}ms interval`) :
                this.logger.debug(`UnSubscribed ${data[ENotifierSubscriberFields.email]}`)
            return true
        } catch (error) {
            this.logger.error((error as Error).message)
            return false
        }
    }
    async addPostToQueue(data: NotifierQueueDTO): Promise<boolean> {
        try {
            await this.queueModel.create({...data,[ENotifierQueueFields.addedAt]: Date.now()})
            this.logger.debug(`Added post to queue ${data[ENotifierQueueFields.postId]}, author: ${data[ENotifierQueueFields.authorName]}`)
            return true
        } catch (error) {
            this.logger.error((error as Error).message)
            return false
        }
    }
}
