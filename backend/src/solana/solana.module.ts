import { Module, forwardRef } from '@nestjs/common'
import { SolanaService } from './solana.service'
import { CoinModule } from 'src/coin/coin.module'
import { WalletModule } from 'src/wallet/wallet.module'

@Module({
  imports: [forwardRef(() => CoinModule), forwardRef(() => WalletModule)],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
