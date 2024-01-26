import { Module } from '@nestjs/common';
import { JwtModule } from './jwt/jwt.module';
import { CookiesModule } from './cookies/cookies.module';
import {GatewayModule} from './gateway/gateway.module';

@Module({
  imports: [GatewayModule, JwtModule, CookiesModule],
  controllers: [],
  providers: [],
})
export class GatewayAppModule {}
