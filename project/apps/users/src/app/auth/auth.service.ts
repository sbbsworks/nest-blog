import {HttpStatus, Injectable} from '@nestjs/common'
import {RpcException} from '@nestjs/microservices'
import {UserEntity, AuthUserRDO, ELoggerMessages, EUserDTOFields, HashPasswordService, TUserId, UserDTO, UserMongoRepositoryService, UserSignInDTO, EId, EMongoId, AppRpcResponse} from '@shared'

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserMongoRepositoryService,
        private readonly hashPasswordService: HashPasswordService,
        private readonly appRpcResponse: AppRpcResponse,
    ){}
    async signup(data: UserDTO): Promise<AuthUserRDO> {
        try {
            const password = await this.hashPasswordService.hash(data[EUserDTOFields.password])
            const user = await this.userRepository.prepareUser({...data, [EUserDTOFields.password]: password})
            return {[EId.id]: await this.userRepository.save(user) as TUserId}
        } catch(error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.signUpBadGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async signin(data: UserSignInDTO): Promise<AuthUserRDO> {
        try {
            const user = await this.userRepository.findByEmail(data[EUserDTOFields.email])
            const validated = user ? await this.hashPasswordService.compare(data.currentPassword, user[EUserDTOFields.password]) : false
            return validated ? {
                [EId.id]: (user as UserEntity)[EMongoId._id] as TUserId,
                [EUserDTOFields.fullName]: (user as UserEntity)[EUserDTOFields.fullName]
            } : {[EId.id]: null}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.signInBadGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
}
