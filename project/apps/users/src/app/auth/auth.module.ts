import {Module} from '@nestjs/common'
import {AuthController} from './auth.controller'
import {AuthService } from './auth.service'
import {AppRpcResponse, BcryptService, HashPasswordService} from '@shared'
import {UserMongoRepositoryModule} from '../user-mongo-repository.module'

@Module({
    imports: [
        UserMongoRepositoryModule
    ],
    controllers: [AuthController],
    providers: [AuthService, AppRpcResponse,
        {
            provide: HashPasswordService,
            useClass: BcryptService
        }
    ],
})
export class AuthModule {}
