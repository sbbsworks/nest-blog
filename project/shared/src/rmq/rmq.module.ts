import {DynamicModule, Module} from '@nestjs/common';
import {RmqService} from './rmq.service';
import {ConfigModule} from '@nestjs/config';
import {rmqConfig} from '../configs/rmq.config';
import {ClientsModule, Transport} from '@nestjs/microservices';

interface RqmModuleOptions {
    name: string;
}
export const getRMQQueueNameString = (name: string): string => {
    return `${rmqConfig()[`RABBIT_MQ_${name}_QUEUE`]}`
}

@Module({
    imports: [
        ConfigModule.forFeature(rmqConfig),
    ],
    providers: [RmqService],
    exports: [RmqService],
})
export class RmqModule {
    static register({name}: RqmModuleOptions): DynamicModule {
        return {
            module: RmqModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name,
                        useFactory: () => {
                            return {
                                transport: Transport.RMQ,
                                options: {
                                    urls: [`${rmqConfig().RABBIT_MQ_URI}`],
                                    queue: getRMQQueueNameString(name),
                                },
                            }
                        },
                        inject: [],
                    }
                ])
            ],
            exports: [ClientsModule]
        }
    }
}
