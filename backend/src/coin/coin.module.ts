import { Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [SessionModule, AuthModule, RedisModule],
  controllers: [CoinController],
  providers: [CoinService],
})
export class CoinModule {}
