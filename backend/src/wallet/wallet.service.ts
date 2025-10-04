import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { Keypair } from '@solana/web3.js'
import { SolanaService } from 'src/solana/solana.service'
import { VaultService } from 'src/vault/vault.service'
import * as bs58 from 'bs58'

@Injectable()
export class WalletService implements OnModuleInit {
  private readonly logger = new Logger(WalletService.name)
  account: Keypair
  isInitialized: Promise<boolean>

  constructor(
    private readonly solana: SolanaService,
    private readonly vault: VaultService
  ) {
    this.isInitialized = Promise.resolve(false)
  }

  async onModuleInit() {
    this.isInitialized = this.initialize()
    await this.isInitialized
  }

  private async initialize(): Promise<boolean> {
    await this.vault.waitForInitialization()

    const secretKey = await this.vault.getRootWalletSecret()
    if (!secretKey) {
      this.logger.warn('Root wallet secret not found. WalletService will remain uninitialized until it is set.')
      return false
    }

    let secretKeyArray: number[]
    try {
      secretKeyArray = JSON.parse(secretKey)
    } catch {
      secretKeyArray = Array.from(bs58.decode(secretKey))
    }
    
    this.account = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray))

    return true
  }

  async getPublicKey(): Promise<string> {
    const initialized = await this.isInitialized
    if (!initialized) {
      throw new Error('Root wallet not initialized')
    }
    return this.account.publicKey.toBase58()
  }
}
