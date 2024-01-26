import {HttpStatus, ValidationPipe} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import {UsersAppModule} from './app/users-app.module'
import {AppRpcResponse, envConfig} from '@shared'
import {Transport} from '@nestjs/microservices'
import {RpcException} from '@nestjs/microservices'

const _envConfig = envConfig()

;(async function () {
    try {
        const app = await NestFactory.create(UsersAppModule)
        app.useGlobalPipes(new ValidationPipe({
            transform: false,
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            disableErrorMessages: false,
            exceptionFactory: (errors) =>  new RpcException(
                (new AppRpcResponse()).makeError({
                    messages: errors.map((error) => error.constraints),
                    statusCode: HttpStatus.BAD_REQUEST,
                }))
        }))
        app.connectMicroservice({
            transport: Transport.TCP,
            options: {
                port: +_envConfig.USERS_API_PORT
            },
        }, {inheritAppConfig: true})
        await app.startAllMicroservices()

        setTimeout(() => {
            console.info('')
            console.info(`Users microservice is running on: localhost:${_envConfig.USERS_API_PORT}`)
            console.info('')
        }, 8000)

    } catch (error) {
        console.error((error as Error).message)
        process.exit(1)
    }
})();
