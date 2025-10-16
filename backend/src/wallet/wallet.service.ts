import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { Keypair } from '@solana/web3.js'
import { SolanaService } from 'src/solana/solana.service'
import { VaultService } from 'src/vault/vault.service'
import * as bs58 from 'bs58'

@Injectable()
export class WalletService implements OnModuleInit {
  private readonly logger = new Logger(WalletService.name)
  private account: Keypair | null = null
  private initializationPromise: Promise<boolean> | null = null

  constructor(
    private readonly solana: SolanaService,
    private readonly vault: VaultService
  ) {}

  async onModuleInit() {
    // Не инициализируем автоматически, только ждем готовности Vault
    await this.vault.waitForInitialization()
    this.logger.log('WalletService initialized, waiting for root wallet to be set')
  }

  private async initialize(): Promise<boolean> {
    try {
      const secretKey = await this.vault.getRootWalletSecret()
      if (!secretKey) {
        this.logger.warn('Root wallet secret not found')
        return false
      }

      let secretKeyArray: number[]
      try {
        secretKeyArray = JSON.parse(secretKey)
      } catch {
        secretKeyArray = Array.from(bs58.decode(secretKey))
      }
      
      this.account = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray))
      this.logger.log('Root wallet initialized successfully')
      return true
    } catch (error) {
      this.logger.error('Failed to initialize root wallet:', error.message)
      return false
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.account) {
      return true
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize()
    }

    return await this.initializationPromise
  }

  async getPublicKey(): Promise<string> {
    const initialized = await this.ensureInitialized()
    if (!initialized || !this.account) {
      throw new Error('Root wallet not initialized')
    }
    return this.account.publicKey.toBase58()
  }

  async refreshWallet(): Promise<void> {
    this.account = null
    this.initializationPromise = null
    await this.ensureInitialized()
  }
}
