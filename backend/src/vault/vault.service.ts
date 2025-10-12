import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import vault from 'node-vault'

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name)
  private client: vault.client
  private readonly VAULT_URL = process.env.VAULT_URL || 'http://localhost:8200'
  private readonly VAULT_TOKEN = process.env.VAULT_TOKEN || ''
  private initializationPromise: Promise<void>

  async onModuleInit() {
    this.initializationPromise = this.initialize()
    await this.initializationPromise
  }

  private async initialize(): Promise<void> {
    try {
      this.logger.log(`Vault configuration: URL=${this.VAULT_URL}, TOKEN=${this.VAULT_TOKEN ? this.VAULT_TOKEN.substring(0, 8) + '...' : 'NOT_SET'}`)
      
      this.client = vault({
        apiVersion: 'v1',
        endpoint: this.VAULT_URL,
        token: this.VAULT_TOKEN,
      })

      // Проверяем подключение к Vault
      await this.client.status()
      this.logger.log('Successfully connected to Vault')
      
      // Инициализируем секреты если их нет
      await this.initializeSecrets()
    } catch (error) {
      this.logger.error('Failed to connect to Vault:', error)
      throw new Error('Vault connection failed')
    }
  }

  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize()
    }

    await this.initializationPromise
  }

  private async initializeSecrets() {
    try {
      // Убеждаемся, что Solana secret engine смонтирован
      await this.ensureSolanaSecretEngine()

      // Проверяем существует ли секрет для root кошелька
      const existingSecret = await this.getSecretDirect('root-wallet')
      
      if (!existingSecret) {
        this.logger.log('Initializing root wallet secret in Vault')
        await this.setSecretDirect('root-wallet', {
          secretKey: '',
          publicKey: '',
          isInitialized: false,
        })
      }
    } catch (error) {
      this.logger.error('Failed to initialize secrets:', error)
    }
  }

  /**
   * Убедиться, что Solana secret engine смонтирован
   */
  private async ensureSolanaSecretEngine(): Promise<void> {
    try {
      // Проверяем, смонтирован ли уже Solana secret engine
      const mounts = await this.client.mounts()
      if (mounts.solana) {
        this.logger.log('Solana secret engine already mounted')
        return
      }

      // Монтируем Solana secret engine
      this.logger.log('Mounting Solana secret engine...')
      await this.client.mount({
        mount_point: 'solana',
        type: 'kv',
        options: { version: '2' }
      })
      this.logger.log('Solana secret engine mounted successfully')
    } catch (error) {
      if (error.response?.statusCode === 400 && error.response?.body?.errors?.includes('path is already in use')) {
        this.logger.log('Solana secret engine already mounted')
      } else {
        this.logger.error('Failed to mount solana secret engine:', error.message)
        throw error
      }
    }
  }

  private async getSecretDirect(path: string): Promise<any> {
    try {
      const result = await this.client.read(`solana/data/${path}`)
      return result.data.data
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  private async setSecretDirect(path: string, data: any): Promise<void> {
    await this.client.write(`solana/data/${path}`, { data })
  }

  /**
   * Получить секрет из Vault
   */
  async getSecret(path: string): Promise<any> {
    await this.waitForInitialization()
    
    try {
      const result = await this.client.read(`solana/data/${path}`)
      return result.data.data
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null
      }
      this.logger.error(`Failed to get secret from path ${path}:`, error)
      throw error
    }
  }

  /**
   * Сохранить секрет в Vault
   */
  async setSecret(path: string, data: any): Promise<void> {
    await this.waitForInitialization()
    
    try {
      await this.client.write(`solana/data/${path}`, { data })
      this.logger.log(`Secret saved to path: ${path}`)
    } catch (error) {
      this.logger.error(`Failed to save secret to path ${path}:`, error)
      throw error
    }
  }


  /**
   * Проверить инициализирован ли root кошелек
   */
  async isRootWalletInitialized(): Promise<boolean> {
    try {
      const secret = await this.getSecret('root-wallet')
      const isInitialized = secret && secret.isInitialized === true && !!secret.secretKey
      this.logger.log(`Root wallet check - secret exists: ${!!secret}, isInitialized: ${secret?.isInitialized}, hasSecretKey: ${!!secret?.secretKey}, result: ${isInitialized}`)
      
      if (secret) {
        this.logger.log('Root wallet secret details:', {
          hasSecretKey: !!secret.secretKey,
          secretKeyLength: secret.secretKey?.length,
          isInitialized: secret.isInitialized,
          updatedAt: secret.updatedAt
        })
      }
      
      return isInitialized
    } catch (error) {
      this.logger.error('Failed to check root wallet initialization:', error)
      return false
    }
  }

  /**
   * Проверить состояние Vault
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.waitForInitialization()
      await this.client.health()
      return true
    } catch (error) {
      this.logger.error('Vault health check failed:', error.message)
      return false
    }
  }

  /**
   * Получить информацию о root кошельке
   */
  async getRootWalletInfo(): Promise<{
    isInitialized: boolean
    updatedAt?: string
  }> {
    try {
      const secret = await this.getSecret('root-wallet')
      
      if (!secret || !secret.secretKey) {
        return { isInitialized: false }
      }

      return {
        isInitialized: secret.isInitialized === true && !!secret.secretKey,
        updatedAt: secret.updatedAt,
      }
    } catch (error) {
      this.logger.error('Failed to get root wallet info:', error)
      return { isInitialized: false }
    }
  }

  /**
   * Получить секретный ключ root кошелька
   */
  async getRootWalletSecret(): Promise<string | null> {
    try {
      const secret = await this.getSecret('root-wallet')
      if (!secret || !secret.secretKey) {
        return null
      }
      return secret.secretKey
    } catch (error) {
      this.logger.error('Failed to get root wallet secret:', error.message)
      return null
    }
  }

  /**
   * Инициализировать root кошелек
   */
  async initializeRootWallet(secretKey: string, force: boolean = false): Promise<{
    isInitialized: boolean
    updatedAt: string
  }> {
    try {
      this.logger.log(`Initializing root wallet with force=${force}`)
      
      // Убеждаемся, что Solana secret engine смонтирован
      await this.ensureSolanaSecretEngine()
      
      // Проверяем, существует ли уже кошелек
      if (!force) {
        const existing = await this.getSecret('root-wallet')
        if (existing && existing.isInitialized) {
          throw new Error('Root wallet already initialized. Use force=true to overwrite.')
        }
      }

      const walletData = {
        secretKey,
        isInitialized: true,
        updatedAt: new Date().toISOString()
      }

      this.logger.log('Saving root wallet data to Vault...')
      await this.setSecret('root-wallet', walletData)
      
      // Проверяем, что данные сохранились
      const saved = await this.getSecret('root-wallet')
      this.logger.log('Root wallet initialized successfully', { 
        saved: !!saved, 
        hasSecretKey: !!saved?.secretKey,
        isInitialized: saved?.isInitialized 
      })
      
      return {
        isInitialized: true,
        updatedAt: walletData.updatedAt
      }
    } catch (error) {
      this.logger.error('Failed to initialize root wallet:', error.message)
      throw error
    }
  }

  /**
   * Обновить root кошелек
   */
  async updateRootWallet(secretKey: string): Promise<{
    isInitialized: boolean
    updatedAt: string
  }> {
    try {
      // Проверяем, что кошелек существует
      const existing = await this.getSecret('root-wallet')
      if (!existing || !existing.isInitialized) {
        throw new Error('Root wallet not initialized. Use initialize method first.')
      }

      const walletData = {
        secretKey,
        isInitialized: true,
        updatedAt: new Date().toISOString()
      }

      await this.setSecret('root-wallet', walletData)
      
      // Проверяем, что данные сохранились
      const saved = await this.getSecret('root-wallet')
      this.logger.log('Root wallet updated successfully', { 
        saved: !!saved, 
        hasSecretKey: !!saved?.secretKey,
        isInitialized: saved?.isInitialized 
      })
      
      return {
        isInitialized: true,
        updatedAt: walletData.updatedAt
      }
    } catch (error) {
      this.logger.error('Failed to update root wallet:', error.message)
      throw error
    }
  }

  /**
   * Удалить root кошелек
   */
  async deleteRootWallet(): Promise<void> {
    try {
      await this.deleteSecret('root-wallet')
      this.logger.log('Root wallet deleted successfully')
    } catch (error) {
      this.logger.error('Failed to delete root wallet:', error.message)
      throw error
    }
  }


  /**
   * Удалить секрет из Vault
   */
  async deleteSecret(path: string): Promise<void> {
    await this.waitForInitialization()
    
    try {
      await this.client.delete(`solana/data/${path}`)
      this.logger.log(`Secret deleted from path: ${path}`)
    } catch (error) {
      this.logger.error(`Failed to delete secret from path ${path}:`, error)
      throw error
    }
  }

  /**
   * Получить список всех секретов
   */
  async listSecrets(path: string = 'solana/data/'): Promise<string[]> {
    await this.waitForInitialization()
    
    try {
      const result = await this.client.list(path)
      return result.data.keys || []
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return []
      }
      this.logger.error(`Failed to list secrets from path ${path}:`, error)
      throw error
    }
  }
}