import { Module, forwardRef } from '@nestjs/common'
import { VaultService } from './vault.service'
import { VaultController } from './vault.controller'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'
import { SettingsModule } from '../settings/settings.module'

@Module({
  imports: [SessionModule, forwardRef(() => AuthModule), SettingsModule],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}