import {Module} from '@nestjs/common';
import {JwtModule as _JwtModule} from '@nestjs/jwt'
import {JwtService} from './jwt.service';
import {jwtConfig} from '@shared';
import {ConfigModule} from '@nestjs/config';

@Module({
    imports: [
        _JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [],
    providers: [JwtService],
    exports: [JwtService]
})
export class JwtModule {}
