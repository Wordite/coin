import { Module, forwardRef } from '@nestjs/common'
import { VaultService } from './vault.service'
import { VaultController } from './vault.controller'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'
import { SettingsModule } from '../settings/settings.module'
import { WalletModule } from '../wallet/wallet.module'

@Module({
  imports: [SessionModule, forwardRef(() => AuthModule), SettingsModule, forwardRef(() => WalletModule)],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}