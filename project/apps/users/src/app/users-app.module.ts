import {Module} from '@nestjs/common'
import {AuthModule} from './auth/auth.module'
import {UserModule} from './user/user.module'
import {UsersMongoModule} from './users-mongo.module'

@Module({
    imports: [
        AuthModule,
        UserModule,
        UsersMongoModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class UsersAppModule {}
