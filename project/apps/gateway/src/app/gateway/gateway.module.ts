import {Module, Scope} from '@nestjs/common'
import {ClientsModule, Transport} from '@nestjs/microservices'
import {AppLogger, EBlogRouts, EUsersRouts, envConfig, jwtConfig} from '@shared'
import {NestjsFormDataModule} from 'nestjs-form-data'
import {AuthProxyController} from './users-proxy/auth-proxy.controller'
import {AuthProxyService} from './users-proxy/auth-proxy.service'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {CookiesModule} from '../cookies/cookies.module'
import {JwtModule} from '../jwt/jwt.module'
import {ConfigModule} from '@nestjs/config'
import {UserProxyController} from './users-proxy/user-proxy.controller'
import {UserProxyService} from './users-proxy/user-proxy.service'
import {BlogActionsProxyController} from './blog-proxy/actions-proxy.controller'
import {BlogActionsProxyService} from './blog-proxy/actions-proxy.service'
import {BlogInfoProxyService} from './blog-proxy/info-proxy.service'
import {BlogInfoProxyController} from './blog-proxy/info-proxy.controller'
import {BlogFeedProxyController} from './blog-proxy/feed-proxy.controller'
import {BlogFeedProxyService} from './blog-proxy/feed-proxy.service'
const _envConfig = envConfig()

@Module({
    imports: [
        NestjsFormDataModule,
        ClientsModule.register([
            {
                name: EUsersRouts.user,
                transport: Transport.TCP,
                options: {
                    port: +_envConfig.USERS_API_PORT
                }
            },
            {
                name: EBlogRouts.blog,
                transport: Transport.TCP,
                options: {
                    port: +_envConfig.BLOG_API_PORT
                }
            }
        ]),
        ConfigModule.forFeature(jwtConfig),
        CookiesModule, JwtModule
    ],
    controllers: [
        AuthProxyController,
        UserProxyController,
        BlogActionsProxyController,
        BlogInfoProxyController,
        BlogFeedProxyController,
    ],
    providers: [
        AuthProxyService,
        UserProxyService,
        BlogActionsProxyService,
        BlogInfoProxyService,
        BlogFeedProxyService,
        {
            provide: APP_INTERCEPTOR,
            scope: Scope.REQUEST,
            useClass: AppLogger
        }],
    exports: [UserProxyService],
})
export class GatewayModule {}
