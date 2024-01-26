import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { BlogPrismaModule } from '../blog-prisma.module';
import {AppRpcResponse, RmqModule, rmqConfig} from '@shared';

const _rmqConfig = rmqConfig()
@Module({
    imports: [
        NestjsFormDataModule,
        BlogPrismaModule,
        RmqModule.register({
            name: `${_rmqConfig.NOTIFIER_RMQ_NAME}`
        }),
    ],
    controllers: [ActionsController],
    providers: [ActionsService, AppRpcResponse],
})
export class ActionsModule {}
