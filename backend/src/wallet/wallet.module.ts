import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { SolanaModule } from '../solana/solana.module';
import { VaultModule } from '../vault/vault.module';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { CoinModule } from '../coin/coin.module';

@Module({
  imports: [forwardRef(() => SolanaModule), VaultModule, SessionModule, forwardRef(() => AuthModule), forwardRef(() => CoinModule)],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
