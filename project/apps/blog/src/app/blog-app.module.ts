import {Module} from '@nestjs/common'
import {ActionsModule} from './actions/actions.module'
import {PostsModule} from './info/info.module'
import {FeedModule} from './feed/feed.module'

@Module({
    imports: [ActionsModule, PostsModule, FeedModule,],
    controllers: [],
    providers: [],
})
export class BlogAppModule {}
