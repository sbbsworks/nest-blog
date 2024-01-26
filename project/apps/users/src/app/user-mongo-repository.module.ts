import { Module } from '@nestjs/common';
import { UserDTOSchema, UserMongoRepositoryService, UserSchema } from '@shared';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserDTOSchema.name,
                schema: UserSchema,
            },
        ])
    ],
    providers: [UserMongoRepositoryService],
    exports: [UserMongoRepositoryService]
})
export class UserMongoRepositoryModule {}
