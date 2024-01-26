import {NestFactory, Reflector} from '@nestjs/core'
import {envConfig, jwtConfig, makeSwagger} from '@shared'
import cookieParser from 'cookie-parser'
import {GatewayAppModule} from './app/getaway-app.module'
import {AuthGuardPassesUserIdToRequest} from './app/guard/auth.guard';
import {JwtService} from './app/jwt/jwt.service';
import {JwtService as _JwtService} from '@nestjs/jwt'

const _envConfig = envConfig()

;(async function () {
    try {
        const app = await NestFactory.create(GatewayAppModule)
        app.setGlobalPrefix(_envConfig.API_PREFIX as string)
        app.useGlobalGuards(
            new AuthGuardPassesUserIdToRequest(
                new Reflector(),
                new JwtService(new _JwtService(), jwtConfig())
            )
        )
        makeSwagger(app, {
            path: `${_envConfig.API_DOCS_PATH}`,
            title: `${_envConfig.API_DOCS_GATEWAY_TITLE}`,
            description: `${_envConfig.API_DOCS_GATEWAY_DESCRIPTION}`,
            version: `${_envConfig.API_PREFIX}`,
            
        })
        app.use(cookieParser())
        await app.listen(+_envConfig.GATEWAY_API_PORT)

        setTimeout(() => {
            console.info('')
            console.info(`Gateway is running on: http://localhost:${_envConfig.GATEWAY_API_PORT}/${_envConfig.API_PREFIX}`)
            console.info(`Gateway docs is running on: http://localhost:${_envConfig.GATEWAY_API_PORT}/${_envConfig.API_DOCS_PATH}`)
            console.info('')
        }, 10000)

    } catch (error) {
        console.error((error as Error).message)
        process.exit(1)
    }
})()
