import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common'
import { Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { SolanaService } from 'src/solana/solana.service'
import { VaultService } from 'src/vault/vault.service'
import { CoinService } from 'src/coin/coin.service'
import { ConfigService } from '@nestjs/config'
import * as bs58 from 'bs58'

@Injectable()
export class WalletService implements OnModuleInit {
  private readonly logger = new Logger(WalletService.name)
  private account: Keypair | null = null
  private initializationPromise: Promise<boolean> | null = null

  constructor(
    @Inject(forwardRef(() => SolanaService))
    private readonly solana: SolanaService,
    private readonly vault: VaultService,
    @Inject(forwardRef(() => CoinService))
    private readonly coin: CoinService,
    private readonly config: ConfigService
  ) {}

  async onModuleInit() {
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
        // @ts-ignore
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

  async getKeypair(): Promise<Keypair> {
    const initialized = await this.ensureInitialized()

    if (!initialized || !this.account) {
      throw new Error('Root wallet not initialized')
    }

    return this.account
  }

  async refreshWallet(): Promise<void> {
    this.account = null
    this.initializationPromise = null
    await this.ensureInitialized()
  }

  /**
   * Send coins (SOL, USDT, or COIN) to a recipient
   */
  async sendCoin(to: string, amount: number, type: 'SOL' | 'USDT' | 'COIN'): Promise<string> {
    this.logger.log(`[SEND COIN START] To: ${to}, Amount: ${amount}, Type: ${type}`)
    
    const keypair = await this.getKeypair()
    const fromAddress = keypair.publicKey.toBase58()
    
    try {
      let signature: string
      
      if (type === 'SOL') {
        this.logger.log(`[SOL TRANSFER] Sending ${amount} SOL from ${fromAddress} to ${to}`)
        signature = await this.sendSol(to, amount)
      } else if (type === 'USDT') {
        this.logger.log(`[USDT TRANSFER] Sending ${amount} USDT from ${fromAddress} to ${to}`)
        const usdtMint = this.config.get<string>('USDT_MINT') || 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
        signature = await this.solana.sendSplToken(to, amount, fromAddress, usdtMint)
      } else if (type === 'COIN') {
        this.logger.log(`[COIN TRANSFER] Sending ${amount} COIN from ${fromAddress} to ${to}`)
        const coinMint = await this.coin.getMintAddress()
        signature = await this.solana.sendSplToken(to, amount, fromAddress, coinMint)
      } else {
        throw new Error(`Unsupported coin type: ${type}`)
      }
      
      this.logger.log(`[SEND COIN SUCCESS] Type: ${type}, Signature: ${signature}`)
      return signature
    } catch (error) {
      this.logger.error(`[SEND COIN ERROR] Type: ${type}, Error: ${error.message}`)
      throw error
    }
  }

  /**
   * Send SOL using native transfer
   */
  private async sendSol(to: string, amount: number): Promise<string> {
    const keypair = await this.getKeypair()
    const connection = await this.solana.getConnection()
    
    const transaction = new Transaction()
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(to),
        lamports,
      })
    )
    
    const { blockhash } = await connection.getLatestBlockhash('finalized')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = keypair.publicKey
    
    transaction.sign(keypair)
    
    const signature = await connection.sendRawTransaction(transaction.serialize())
    await connection.confirmTransaction(signature, 'finalized')
    
    return signature
  }

  /**
   * Check if a transaction was received and its status
   */
  async checkIsReceived(signature: string): Promise<{
    exists: boolean
    isSuccessful: boolean
    isFinalized: boolean
    error?: any
  }> {
    this.logger.log(`[CHECK RECEIVED START] Signature: ${signature}`)
    
    const maxAttempts = 3
    const delayMs = 2000
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`[TX CHECK ATTEMPT ${attempt}/${maxAttempts}] Checking across all RPCs`)
      
      // Get all available RPC endpoints
      const rpcEndpoints = await this.solana.getAllRpcEndpoints()
      this.logger.log(`[TX CHECK] Found ${rpcEndpoints.length} RPC endpoints to check`)
      
      // Try each RPC endpoint
      for (const rpcUrl of rpcEndpoints) {
        try {
          this.logger.log(`[TX CHECK] Trying RPC: ${rpcUrl}`)
          const txData = await this.solana.getTransactionFromRpc(signature, rpcUrl)
          
          if (txData) {
            this.logger.log(`[TX CHECK] Transaction found on RPC: ${rpcUrl}`)
            
            // Check signature status
            const connection = await this.solana.getConnection()
            const status = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true })
            const statusInfo = status?.value?.[0]
            
            const errFromTxData = txData.meta?.err
            const errFromStatus = statusInfo?.err
            const confirmationStatus = statusInfo?.confirmationStatus
            const effectiveErr = errFromTxData !== undefined ? errFromTxData : errFromStatus
            
            const isSuccessful = effectiveErr === null || effectiveErr === undefined
            const isFinalized = confirmationStatus === 'finalized'
            
            this.logger.log(`[CHECK RECEIVED RESULT] Exists: true, Success: ${isSuccessful}, Finalized: ${isFinalized}`)
            
            return {
              exists: true,
              isSuccessful,
              isFinalized,
              error: effectiveErr
            }
          }
        } catch (error) {
          this.logger.warn(`[TX CHECK] Error checking RPC ${rpcUrl}:`, error)
          continue
        }
      }

      await new Promise(resolve => setTimeout(resolve, delayMs))
      
      // If not found after trying all RPCs, wait before next attempt
      if (attempt < maxAttempts) {
        this.logger.log(`[TX CHECK] Transaction not found, waiting ${delayMs}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
    
    // Transaction not found after all attempts
    this.logger.log(`[CHECK RECEIVED RESULT] Transaction not found after ${maxAttempts} attempts across all RPCs`)
    return { exists: false, isSuccessful: false, isFinalized: false }
  }

  /**
   * Check if Associated Token Account exists for a wallet and mint
   */
  async checkAtaExists(walletAddress: string, mint: PublicKey): Promise<boolean> {
    this.logger.log(`[CHECK ATA] Wallet: ${walletAddress}, Mint: ${mint.toBase58()}`)
    
    try {
      const connection = await this.solana.getConnection()
      const { getAssociatedTokenAddress } = await import('@solana/spl-token')
      
      const ataAddress = await getAssociatedTokenAddress(mint, new PublicKey(walletAddress))
      const accountInfo = await connection.getAccountInfo(ataAddress)
      
      const exists = !!accountInfo
      this.logger.log(`[CHECK ATA RESULT] Exists: ${exists}`)
      
      return exists
    } catch (error) {
      this.logger.error(`[CHECK ATA ERROR] Wallet: ${walletAddress}, Error: ${error.message}`)
      return false
    }
  }

  /**
   * Get ATA creation cost in SOL
   */
  getAtaCreationCost(): number {
    // return 0.00203928 // SOL cost for creating ATA
    return 0 // Disabled ATA creation cost for now
  }

  /**
   * Get current SOL balance of root wallet (using direct connection for admin UI)
   */
  async getSolBalance(): Promise<number> {
    try {
      const keypair = await this.getKeypair()
      const balance = await this.solana.getBalanceDirect(keypair.publicKey.toBase58())
      return balance.sol
    } catch (error) {
      this.logger.error(`[GET SOL BALANCE ERROR] ${error.message}`)
      return 0
    }
  }

  /**
   * Get current COIN balance of root wallet (using direct connection for admin UI)
   */
  async getCoinBalance(): Promise<number> {
    try {
      const keypair = await this.getKeypair()
      const balance = await this.solana.getBalanceDirect(keypair.publicKey.toBase58())
      return balance.coin
    } catch (error) {
      this.logger.error(`[GET COIN BALANCE ERROR] ${error.message}`)
      return 0
    }
  }

  /**
   * Get mint token balance for the mint address (using direct connection for admin UI)
   */
  async getMintTokenBalance(): Promise<number> {
    this.logger.log('[GET MINT TOKEN BALANCE] Starting to fetch mint token balance')
    
    try {
      const keypair = await this.getKeypair()
      const walletAddress = keypair.publicKey.toString()
      this.logger.log(`[GET MINT TOKEN BALANCE] Wallet address: ${walletAddress}`)
      
      const mintAddress = await this.coin.getMintAddress()
      this.logger.log(`[GET MINT TOKEN BALANCE] Mint address: ${mintAddress}`)
      
      const balance = await this.solana.getParsedTokenBalanceByMintDirect(
        walletAddress, 
        new PublicKey(mintAddress)
      )
      
      this.logger.log(`[GET MINT TOKEN BALANCE] Balance retrieved: ${balance} tokens`)
      return balance
    } catch (error) {
      this.logger.error('[GET MINT TOKEN BALANCE] Error:', error)
      throw error
    }
  }
}
