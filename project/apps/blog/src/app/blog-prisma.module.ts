import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogPrismaService, FeedsPrismaRepositoryService, PostsPrismaRepositoryService, CommentsPrismaRepositoryService, LikesPrismaRepositoryService, appConfig} from '@shared';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [appConfig],
        })
    ],
    providers: [BlogPrismaService, PostsPrismaRepositoryService, LikesPrismaRepositoryService, FeedsPrismaRepositoryService, CommentsPrismaRepositoryService],
    exports: [BlogPrismaService, PostsPrismaRepositoryService, LikesPrismaRepositoryService, FeedsPrismaRepositoryService, CommentsPrismaRepositoryService]
})
export class BlogPrismaModule {}
