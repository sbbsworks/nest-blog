import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common'
import {ClientProxy, RpcException} from '@nestjs/microservices'
import {AppRpcResponse, ChangeUserPasswordRDO, ELoggerMessages, ENotifierSubscriberFields, ERmqEvents, EUserDTOFields, HashPasswordService, ReturnedUserRDO, SubscribedToPostsRDO, TUserId, UserIdDTO, UserMongoRepositoryService, UserUpdatePasswordDTO, rmqConfig} from '@shared'
import {UserEntity} from 'shared/src/entities/user.entity'
import {Types} from 'mongoose'
import {lastValueFrom} from 'rxjs'

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserMongoRepositoryService,
        private readonly hashPasswordService: HashPasswordService,
        @Inject(`${rmqConfig().NOTIFIER_RMQ_NAME}`)
        private readonly notifierRqmService: ClientProxy,
        private readonly appRpcResponse: AppRpcResponse,
    ){}
    async findOne(userId: UserIdDTO): Promise<ReturnedUserRDO> {
        try {
            const {userId: id} = userId
            if(!id || !Types.ObjectId.isValid(id)) {
                throw new HttpException(`${id} ${ELoggerMessages.invalidId}`, HttpStatus.BAD_REQUEST)
            }
            const user = await this.userRepository.findOne(id)
            if(!user) {
                throw new HttpException(ELoggerMessages.notFound, HttpStatus.NOT_FOUND)
            }
            return await this.userRepository.prepareReturnedUser(user as UserEntity)
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async updatePassword(data: UserUpdatePasswordDTO): Promise<ChangeUserPasswordRDO> {
        try {
            const user = await this.userRepository.findOne(data.userId)
            if(!user) {
                throw new HttpException(ELoggerMessages.notFound, HttpStatus.NOT_FOUND)
            }
            const validated = user ? await this.hashPasswordService.compare(data.currentPassword, (user as UserEntity)[EUserDTOFields.password]) : false
            if(!validated) {
                throw new HttpException(ELoggerMessages.badCredentials, HttpStatus.UNAUTHORIZED)
            }
            const updated = await this.userRepository.update(data.userId, {[EUserDTOFields.password]: await this.hashPasswordService.hash(data[EUserDTOFields.password])})
            return {result: updated}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.passwordNotChanged,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async subscribeToNewPostsNotifier(userId: TUserId, fullName: string, interval: number): Promise<SubscribedToPostsRDO> {
        try {
            const {[EUserDTOFields.email]: email} = await this.userRepository.findOne(userId) as ReturnedUserRDO
            return await lastValueFrom(this.notifierRqmService.send(ERmqEvents.subscribeToPosts, {
                [ENotifierSubscriberFields.email]: email,
                [ENotifierSubscriberFields.fullName]: fullName,
                [ENotifierSubscriberFields.interval]: interval,
            }))
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.coudNotSubscribe,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }

    async hydrator(usersIds: TUserId[]) {
        try {
            return Promise.all((await this.userRepository.findUsersByIds(usersIds)).map(async (user) => {
                return await this.userRepository.prepareReturnedUser(user)
            }))
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
}
