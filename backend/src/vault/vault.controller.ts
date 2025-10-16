import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { VaultService } from './vault.service'  
import { WalletService } from '../wallet/wallet.service'
import { Roles } from '../auth/constants/roles.constant'
import { Auth } from '../auth/decorators/auth.decorator'

@Controller('vault')
export class VaultController {
  constructor(
    private readonly vaultService: VaultService,
    private readonly walletService: WalletService
  ) {}

  @Get('status')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getVaultStatus() {
    try {
      const isHealthy = await this.vaultService.isHealthy()
      const isRootWalletInitialized = await this.vaultService.isRootWalletInitialized()
      return { isConnected: isHealthy, isRootWalletInitialized }
    } catch (error) {
      return { isConnected: false, isRootWalletInitialized: false, error: error.message }
    }
  }

  @Get('diagnose')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async diagnoseVault() {
    try {
      const state = await this.vaultService.checkAndFixVaultState()
      return state
    } catch (error) {
      return { 
        isHealthy: false, 
        solanaEngineMounted: false, 
        solanaEngineFunctional: false, 
        message: `Diagnosis failed: ${error.message}` 
      }
    }
  }

  @Post('mount-solana')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async mountSolanaEngine() {
    try {
      await this.vaultService.ensureSolanaSecretEngine()
      return { message: 'Solana engine mounted successfully' }
    } catch (error) {
      throw new Error(`Failed to mount Solana engine: ${error.message}`)
    }
  }

  @Get('root-wallet')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getRootWalletInfo() {
    try {
      const info = await this.vaultService.getRootWalletInfo()
      return { ...info }
    } catch (error) {
      return { error: 'Failed to get root wallet info' }
    }
  }


  @Post('root-wallet')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async initializeRootWallet(@Body() body: { secretKey: string; force?: boolean }) {
    try {
      const result = await this.vaultService.initializeRootWallet(body.secretKey, body.force)
      
      // Обновляем WalletService после успешной инициализации
      try {
        await this.walletService.refreshWallet()
      } catch (refreshError) {
        console.warn('Failed to refresh wallet after initialization:', refreshError.message)
      }
      
      return result
    } catch (error) {
      // Возвращаем ошибку с правильным HTTP статусом
      throw new Error(error.message || 'Failed to initialize root wallet')
    }
  }

  @Put('root-wallet')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async updateRootWallet(@Body() body: { secretKey: string }) {
    try {
      const result = await this.vaultService.updateRootWallet(body.secretKey)
      
      // Обновляем WalletService после успешного обновления
      try {
        await this.walletService.refreshWallet()
      } catch (refreshError) {
        console.warn('Failed to refresh wallet after update:', refreshError.message)
      }
      
      return result
    } catch (error) {
      // Возвращаем ошибку с правильным HTTP статусом
      throw new Error(error.message || 'Failed to update root wallet')
    }
  }

  @Delete('root-wallet')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async deleteRootWallet() {
    try {
      await this.vaultService.deleteRootWallet()
      return { message: 'Root wallet deleted successfully' }
    } catch (error) {
      return { error: error.message || 'Failed to delete root wallet' }
    }
  }

  @Get('secrets')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async listSecrets(@Param('path') path?: string) {
    try {
      const secrets = await this.vaultService.listSecrets(path)
      return { secrets }
    } catch (error) {
      return { error: 'Failed to list secrets' }
    }
  }

  @Get('secrets/*')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getSecret(@Param('0') path: string) {
    try {
      const secret = await this.vaultService.getSecret(path)
      if (!secret) {
        return { error: 'Secret not found' }
      }
      return { secret }
    } catch (error) {
      return { error: 'Failed to get secret' }
    }
  }

  @Post('secrets/*')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async setSecret(@Param('0') path: string, @Body() data: any) {
    try {
      await this.vaultService.setSecret(path, data)
      return { message: 'Secret saved successfully' }
    } catch (error) {
      return { error: 'Failed to save secret' }
    }
  }

  @Delete('secrets/*')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async deleteSecret(@Param('0') path: string) {
    try {
      await this.vaultService.deleteSecret(path)
      return { message: 'Secret deleted successfully' }
    } catch (error) {
      return { error: 'Failed to delete secret' }
    }
  }
}