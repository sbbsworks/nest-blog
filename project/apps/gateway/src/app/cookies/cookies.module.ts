import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '@shared';
import {CookiesService} from './cookies.service';

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [],
    providers: [CookiesService],
    exports: [CookiesService]
})
export class CookiesModule {}
