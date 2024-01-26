import {Module} from '@nestjs/common'
import {FeedController} from './feed.controller'
import {FeedService} from './feed.service'
import {BlogPrismaModule} from '../blog-prisma.module'
import {AppRpcResponse} from '@shared'

@Module({
    imports: [BlogPrismaModule],
    controllers: [FeedController,],
    providers: [FeedService, AppRpcResponse],
})
export class FeedModule {}
