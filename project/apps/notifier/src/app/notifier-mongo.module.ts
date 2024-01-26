import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { notifierConfig } from '@shared';

const _notifierConfig = notifierConfig()

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${_notifierConfig.NOTIFIER_INITDB_CONTAINER1}:${_notifierConfig.NOTIFIER_INITDB_PORT}`, {
        replicaSet: 'rs0',
        dbName: `${_notifierConfig.NOTIFIER_DEFAULT_DB_NAME}`,
        directConnection: true,
        readPreference: 'primary',
    }),
  ],
  controllers: [],
})
export class NotifierMongoModule {}
