import {Inject, Injectable} from '@nestjs/common';
import {ConfigType} from '@nestjs/config';
import {RmqContext, RmqOptions, Transport} from '@nestjs/microservices'
import {rmqConfig as _rmqConfig, getRMQQueueNameString} from '@shared'

@Injectable()
export class RmqService {
    constructor(
        @Inject(_rmqConfig.KEY)
        private readonly rmqConfig: ConfigType<typeof _rmqConfig>
    ) {}
    getOptions(queue: string, noAck = false): RmqOptions {
        return {
            transport: Transport.RMQ,
            options: {
                urls:[`${this.rmqConfig.RABBIT_MQ_URI}`],
                queue: `${getRMQQueueNameString(queue)}`,
                noAck,
                persistent: true
            }
        }
    }
    acknowledge(context: RmqContext) {
        const channel = context.getChannelRef()
        const originalMessage = context.getMessage()
        channel.ack(originalMessage)
    }
}
