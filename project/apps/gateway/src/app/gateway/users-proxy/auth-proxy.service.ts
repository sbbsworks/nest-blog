import {HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import {AppError, AuthUserRDO, EId, ELoggerMessages, EUserDTOFields, EUsersRouts, JWTRDO, UserDTO, UserSignInDTO} from '@shared'
import {ClientProxy} from '@nestjs/microservices'
import {lastValueFrom} from 'rxjs'
import {JwtService} from '../../jwt/jwt.service'

@Injectable()
export class AuthProxyService {
    constructor(
        @Inject(EUsersRouts.user) private readonly userClient: ClientProxy,
        private readonly jwtService: JwtService
    ){}
    async signup(data: UserDTO) {
        try {
            return await lastValueFrom(this.userClient.send(
                EUsersRouts.signup,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data[EUserDTOFields.email],
            })
        }
    }
    async signin(data: UserSignInDTO): Promise<JWTRDO> {
        try {
            const {[EId.id]: userId, [EUserDTOFields.fullName]: fullName} = await lastValueFrom(this.userClient.send(
                EUsersRouts.signin,
                data
            )) as AuthUserRDO
            if (!userId) {
                throw new HttpException(ELoggerMessages.badCredentials, HttpStatus.UNAUTHORIZED)
            }
            return await this.jwtService.issue(`${userId}`, {fullName})
        } catch(error) {
            throw new AppError({
                error,
                payload: data[EUserDTOFields.email],
            })
        }
    }
}
