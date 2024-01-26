import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { BlogPrismaModule } from '../blog-prisma.module';
import {AppRpcResponse} from '@shared';

@Module({
    imports: [BlogPrismaModule],
    controllers: [InfoController,],
    providers: [InfoService, AppRpcResponse],
})
export class PostsModule {}
