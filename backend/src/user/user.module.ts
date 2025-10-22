import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { TokenInvalidationService } from '../auth/services/token-invalidation.service';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { SolanaModule } from '../solana/solana.module';
import { WalletModule } from '../wallet/wallet.module';
import { AntiSpamModule } from '../anti-spam/anti-spam.module';
import { SettingsModule } from '../settings/settings.module';
import { CoinModule } from '../coin/coin.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [PrismaModule, RedisModule, forwardRef(() => SessionModule), forwardRef(() => AuthModule), SolanaModule, WalletModule, AntiSpamModule, SettingsModule, forwardRef(() => CoinModule), TransactionModule],
  controllers: [UserController],
  providers: [UserService, TokenInvalidationService],
  exports: [UserService],
})
export class UserModule {}
