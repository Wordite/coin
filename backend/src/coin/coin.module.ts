import { Module, forwardRef } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { SolanaModule } from '../solana/solana.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [SessionModule, forwardRef(() => AuthModule), RedisModule, forwardRef(() => SolanaModule), forwardRef(() => WalletModule)],
  controllers: [CoinController],
  providers: [CoinService],
  exports: [CoinService],
})
export class CoinModule {}
