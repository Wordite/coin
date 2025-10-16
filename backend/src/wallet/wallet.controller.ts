import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { VaultService } from '../vault/vault.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../auth/constants/roles.constant';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly vaultService: VaultService
  ) {}

  @Get('public-key')
  @Auth({ public: true, antiSpam: false }) // TODO: Remove antiSpam: false
  async getPublicKey() {
    const publicKey = await this.walletService.getPublicKey()
    return { publicKey }
  }

  @Get('root-wallet-status')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getRootWalletStatus() {
    const isInitialized = await this.vaultService.isRootWalletInitialized()
    console.log('WalletController getRootWalletStatus - isInitialized:', isInitialized)
    
    return {
      isRootWalletInitialized: isInitialized
    }
  }

  @Post('refresh')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async refreshWallet() {
    try {
      await this.walletService.refreshWallet()
      return { message: 'Wallet refreshed successfully' }
    } catch (error) {
      throw new Error(`Failed to refresh wallet: ${error.message}`)
    }
  }
}
