import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoUsersConfig } from '@shared';

const _mongoUsersConfig = mongoUsersConfig()

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${_mongoUsersConfig.MONGO_INITDB_CONTAINER}:${_mongoUsersConfig.MONGO_INITDB_PORT}/${_mongoUsersConfig.MONGO_USERS_DEFAULT_DB_NAME}`, {
        user: `${_mongoUsersConfig.MONGO_INITDB_ROOT_USERNAME}`,
        pass: `${_mongoUsersConfig.MONGO_INITDB_ROOT_PASSWORD}`,
        authSource: 'admin',
    }),
  ],
  controllers: [],
})
export class UsersMongoModule {}
