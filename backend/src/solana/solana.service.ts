import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Connection,
  clusterApiUrl,
  ParsedTransactionWithMeta,
  SignatureResult,
  RpcResponseAndContext,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js'
import { CoinService } from 'src/coin/coin.service'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { WalletService } from 'src/wallet/wallet.service'
import { RedisService } from 'src/redis/redis.service'
import Bottleneck from 'bottleneck'
import { makeProxyConnection } from './proxy-connection'
import { EndpointManager, RpcEndpoint } from './endpoint-manager'


@Injectable()
export class SolanaService {
  private proxyConnection: Connection
  private readonly fallbackConnection: Connection = new Connection(clusterApiUrl('mainnet-beta'))
  private logger = new Logger(SolanaService.name)

  private readLimiter: Bottleneck
  private writeLimiter: Bottleneck
  private endpointManager: EndpointManager
  private connections: Map<string, Connection> = new Map()
  private proxyConnections: Map<string, Connection> = new Map()

  private isInitialized: Promise<void> | null = null
  private _resolveInitialized: (() => void) | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => CoinService))
    private readonly coin: CoinService,
    @Inject(forwardRef(() => WalletService))
    private readonly wallet: WalletService,
    private readonly redis: RedisService
  ) {
    // Don't initialize in constructor - use lazy initialization
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      this.logger.log(`[SOLANA SERVICE] Service not initialized, starting initialization...`)
      this.isInitialized = new Promise<void>((res) => {
        this._resolveInitialized = res
      })
      this.initializeService().catch(error => {
        this.logger.error('Failed to initialize SolanaService:', error)
        this._resolveInitialized?.()
      })
    }
    await this.isInitialized
  }

  private async initializeService(): Promise<void> {
    try {
      this.logger.log(`[SOLANA INIT] Starting service initialization...`)

      // Get rate limits and endpoints from database
      const rateLimits = await this.coin.getRateLimits()
      this.logger.log(`[SOLANA INIT] Rate limits:`, rateLimits)

      const endpoints = await this.coin.getRpcEndpoints()
      this.logger.log(`[SOLANA INIT] Endpoints:`, JSON.stringify(endpoints, null, 2))
      this.logger.log(`[SOLANA INIT] Endpoints length:`, endpoints?.length || 0)
      this.logger.log(`[SOLANA INIT] Endpoints type:`, Array.isArray(endpoints) ? 'array' : typeof endpoints)

      // Validate each endpoint
      this.logger.log(`[SOLANA INIT] Validating ${endpoints.length} endpoints...`)
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i]
        this.logger.log(`[SOLANA INIT] Validating endpoint ${i}:`, JSON.stringify(endpoint, null, 2))
        if (!endpoint.url || typeof endpoint.url !== 'string') {
          this.logger.error(`[SOLANA INIT] Invalid endpoint at index ${i}:`, endpoint)
          throw new Error(`Invalid endpoint at index ${i}: missing or invalid URL`)
        }
        if (!endpoint.name || typeof endpoint.name !== 'string') {
          this.logger.error(`[SOLANA INIT] Invalid endpoint at index ${i}:`, endpoint)
          throw new Error(`Invalid endpoint at index ${i}: missing or invalid name`)
        }
      }
      this.logger.log(`[SOLANA INIT] All endpoints validated successfully`)

      // Check if we have valid data
      if (!rateLimits || !endpoints || endpoints.length === 0) {
        this.logger.error(`[SOLANA INIT] Invalid initialization data:`, {
          rateLimits: !!rateLimits,
          endpointsLength: endpoints?.length || 0,
          endpoints
        })

        // Use fallback values
        this.logger.warn(`[SOLANA INIT] Using fallback values for initialization`)
        const fallbackRateLimits = { readLimit: 50, writeLimit: 3 }
        const fallbackEndpoints = [
          {
            url: 'https://api.mainnet-beta.solana.com',
            priority: 1,
            name: 'Fallback RPC'
          }
        ]

        Object.assign(rateLimits, fallbackRateLimits)
        endpoints.length = 0
        endpoints.push(...fallbackEndpoints)

        this.logger.log(`[SOLANA INIT] Using fallback rate limits:`, fallbackRateLimits)
        this.logger.log(`[SOLANA INIT] Using fallback endpoints:`, fallbackEndpoints)
      }

      // Create Redis-backed limiters
      this.logger.log(`[SOLANA INIT] Creating Redis limiters...`)
      this.logger.log(`[SOLANA INIT] Redis config:`, {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD ? '[HIDDEN]' : 'none'
      })

      try {
        this.logger.log(`[SOLANA INIT] Creating read limiter with config:`, {
          id: 'solana-read-limiter',
          datastore: 'ioredis',
          reservoir: rateLimits.readLimit,
          maxConcurrent: Math.min(rateLimits.readLimit, 10),
          minTime: Math.floor(1000 / rateLimits.readLimit),
          redisHost: process.env.REDIS_HOST || 'localhost',
          redisPort: parseInt(process.env.REDIS_PORT || '6379'),
          hasPassword: !!process.env.REDIS_PASSWORD
        })

        this.readLimiter = new Bottleneck({
          id: 'solana-read-limiter',
          datastore: 'ioredis',
          clientOptions: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          },
          reservoir: rateLimits.readLimit,
          reservoirRefreshAmount: rateLimits.readLimit,
          reservoirRefreshInterval: 1000,
          maxConcurrent: Math.min(rateLimits.readLimit, 10),
          minTime: Math.floor(1000 / rateLimits.readLimit),
        })
        this.logger.log(`[SOLANA INIT] Read limiter created successfully`)
      } catch (error) {
        this.logger.error(`[SOLANA INIT] Failed to create read limiter:`, error)
        this.logger.error(`[SOLANA INIT] Error type:`, error?.constructor?.name)
        this.logger.error(`[SOLANA INIT] Error message:`, error?.message)
        this.logger.error(`[SOLANA INIT] Error stack:`, error?.stack)

        // Fallback to local limiter without Redis
        this.logger.warn(`[SOLANA INIT] Creating local read limiter as fallback`)
        this.readLimiter = new Bottleneck({
          id: 'solana-read-limiter-local',
          reservoir: rateLimits.readLimit,
          reservoirRefreshAmount: rateLimits.readLimit,
          reservoirRefreshInterval: 1000,
          maxConcurrent: Math.min(rateLimits.readLimit, 10),
          minTime: Math.floor(1000 / rateLimits.readLimit),
        })
        this.logger.log(`[SOLANA INIT] Local read limiter created as fallback`)
      }

      try {
        this.logger.log(`[SOLANA INIT] Creating write limiter with config:`, {
          id: 'solana-write-limiter',
          datastore: 'ioredis',
          reservoir: rateLimits.writeLimit,
          maxConcurrent: Math.min(rateLimits.writeLimit, 3),
          minTime: Math.floor(1000 / rateLimits.writeLimit),
          redisHost: process.env.REDIS_HOST || 'localhost',
          redisPort: parseInt(process.env.REDIS_PORT || '6379'),
          hasPassword: !!process.env.REDIS_PASSWORD
        })

        this.writeLimiter = new Bottleneck({
          id: 'solana-write-limiter',
          datastore: 'ioredis',
          clientOptions: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          },
          reservoir: rateLimits.writeLimit,
          reservoirRefreshAmount: rateLimits.writeLimit,
          reservoirRefreshInterval: 1000,
          maxConcurrent: Math.min(rateLimits.writeLimit, 3),
          minTime: Math.floor(1000 / rateLimits.writeLimit),
        })
        this.logger.log(`[SOLANA INIT] Write limiter created successfully`)
      } catch (error) {
        this.logger.error(`[SOLANA INIT] Failed to create write limiter:`, error)
        this.logger.error(`[SOLANA INIT] Error type:`, error?.constructor?.name)
        this.logger.error(`[SOLANA INIT] Error message:`, error?.message)
        this.logger.error(`[SOLANA INIT] Error stack:`, error?.stack)

        // Fallback to local limiter without Redis
        this.logger.warn(`[SOLANA INIT] Creating local write limiter as fallback`)
        this.writeLimiter = new Bottleneck({
          id: 'solana-write-limiter-local',
          reservoir: rateLimits.writeLimit,
          reservoirRefreshAmount: rateLimits.writeLimit,
          reservoirRefreshInterval: 1000,
          maxConcurrent: Math.min(rateLimits.writeLimit, 3),
          minTime: Math.floor(1000 / rateLimits.writeLimit),
        })
        this.logger.log(`[SOLANA INIT] Local write limiter created as fallback`)
      }

      // Initialize endpoint manager
      this.logger.log(`[SOLANA INIT] Initializing endpoint manager with ${endpoints.length} endpoints`)
      this.logger.log(`[SOLANA INIT] Endpoints for manager:`, endpoints)

      try {
        this.endpointManager = new EndpointManager(endpoints)
        this.logger.log(`[SOLANA INIT] Endpoint manager created successfully`)
      } catch (error) {
        this.logger.error(`[SOLANA INIT] Failed to create endpoint manager:`, error)
        throw error
      }

      // Create connections for each endpoint
      this.logger.log(`[SOLANA INIT] Creating connections for endpoints...`)
      for (const endpoint of endpoints) {
        this.logger.log(`[SOLANA INIT] Creating connection for: ${endpoint.url}`)

        try {
          const connection = new Connection(endpoint.url)
          this.connections.set(endpoint.url, connection)
          this.logger.log(`[SOLANA INIT] Basic connection created for: ${endpoint.url}`)

          // Create proxy connection with rate limiting
          try {
            const proxyConnection = makeProxyConnection(connection, {
              readLimiter: this.readLimiter,
              writeLimiter: this.writeLimiter,
            })
            this.proxyConnections.set(endpoint.url, proxyConnection)
            this.logger.log(`[SOLANA INIT] Proxy connection created for: ${endpoint.url}`)
          } catch (error) {
            this.logger.error(`[SOLANA INIT] Failed to create proxy connection for ${endpoint.url}:`, error)
            throw error
          }
        } catch (error) {
          this.logger.error(`[SOLANA INIT] Failed to create basic connection for ${endpoint.url}:`, error)
          throw error
        }
      }
      
      this.logger.log(`[SOLANA INIT] Total proxyConnections created: ${this.proxyConnections.size}`)
      this.logger.log(`[SOLANA INIT] ProxyConnections keys:`, Array.from(this.proxyConnections.keys()))

      // Set the primary proxy connection
      const primaryEndpoint = this.endpointManager.getNextEndpoint()
      if (primaryEndpoint) {
        this.proxyConnection = this.proxyConnections.get(primaryEndpoint.url)!
      } else {
        // Fallback to public RPC with rate limiting
        const fallbackProxy = makeProxyConnection(this.fallbackConnection, {
          readLimiter: this.readLimiter,
          writeLimiter: this.writeLimiter,
        })
        this.proxyConnection = fallbackProxy
      }

      this._resolveInitialized?.()
      this.logger.log(`[SOLANA INIT] ✅ SolanaService initialized successfully with ${endpoints.length} endpoints and rate limits: ${rateLimits.readLimit} read/s, ${rateLimits.writeLimit} write/s`)
    } catch (error) {
      this.logger.error('[SOLANA INIT] ❌ Failed to initialize SolanaService:', error)
      this.logger.error('[SOLANA INIT] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      // Fallback to public RPC
      this.proxyConnection = this.fallbackConnection
      this._resolveInitialized?.()
    }
  }

  private async executeWithRetry<T>(
    operation: (conn: Connection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    this.logger.log(`[EXECUTE WITH RETRY] Starting executeWithRetry with maxRetries: ${maxRetries}`)
    
    // Ensure service is initialized
    await this.ensureInitialized()
    
    // Check if service is initialized
    if (!this.endpointManager) {
      this.logger.error(`[EXECUTE WITH RETRY] Service not initialized! endpointManager is null`)
      throw new Error('SolanaService not initialized')
    }
    
    if (!this.proxyConnections || this.proxyConnections.size === 0) {
      this.logger.error(`[EXECUTE WITH RETRY] Service not initialized! proxyConnections is empty`)
      throw new Error('SolanaService not initialized - no proxy connections')
    }
    
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.log(`[EXECUTE WITH RETRY] Attempt ${attempt}/${maxRetries}`)
      try {
        this.logger.log(`[EXECUTE WITH RETRY] Getting next endpoint...`)
        const endpoint = this.endpointManager.getNextEndpoint()
        this.logger.log(`[EXECUTE WITH RETRY] Endpoint result:`, endpoint ? endpoint.url : 'null')
        
        if (!endpoint) {
          this.logger.error(`[EXECUTE WITH RETRY] No healthy endpoints available`)
          throw new Error('No healthy endpoints available')
        }

        this.logger.log(`[EXECUTE WITH RETRY] Looking for connection in proxyConnections...`)
        this.logger.log(`[EXECUTE WITH RETRY] Available connections:`, Array.from(this.proxyConnections.keys()))
        
        const connection = this.proxyConnections.get(endpoint.url)
        this.logger.log(`[EXECUTE WITH RETRY] Connection found:`, connection ? 'yes' : 'no')
        
        if (!connection) {
          this.logger.error(`[EXECUTE WITH RETRY] No connection found for endpoint: ${endpoint.url}`)
          throw new Error(`No connection found for endpoint: ${endpoint.url}`)
        }

        this.logger.log(`[EXECUTE WITH RETRY] Using endpoint: ${endpoint.url}`)
        const result = await operation(connection)
        
        this.logger.log(`[EXECUTE WITH RETRY] Operation successful on attempt ${attempt}`)
        // Mark success
        this.endpointManager.markSuccess(endpoint)
        return result
      } catch (error) {
        lastError = error
        
        // Mark failure if we have endpoint info
        const endpoint = this.endpointManager.getNextEndpoint()
        if (endpoint) {
          this.endpointManager.markFailure(endpoint, error)
        }

        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // If all endpoints failed, try fallback
    try {
      const fallbackProxy = makeProxyConnection(this.fallbackConnection, {
        readLimiter: this.readLimiter,
        writeLimiter: this.writeLimiter,
      })
      return await operation(fallbackProxy)
    } catch (fallbackError) {
      this.logger.error('All endpoints and fallback failed:', fallbackError)
      throw lastError || fallbackError
    }
  }

  async getTransactionData(signature: string): Promise<ParsedTransactionWithMeta | null> {
    await this.ensureInitialized()
    return this.executeWithRetry(conn =>
      conn.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })
    ).catch(() => null)
  }

  async getConnection(): Promise<Connection> {
    await this.ensureInitialized()
    return this.proxyConnection ?? this.fallbackConnection
  }

  /**
   * Get all available RPC endpoints (including fallback)
   */
  async getAllRpcEndpoints(): Promise<string[]> {
    await this.ensureInitialized()
    const endpoints: string[] = []
    
    // Add all configured proxy connections
    for (const [url] of this.proxyConnections.entries()) {
      endpoints.push(url)
    }
    
    // Add fallback if not already included
    const fallbackUrl = this.fallbackConnection.rpcEndpoint
    if (!endpoints.includes(fallbackUrl)) {
      endpoints.push(fallbackUrl)
    }
    
    return endpoints
  }

  /**
   * Check transaction on specific RPC endpoint
   */
  async getTransactionFromRpc(signature: string, rpcUrl: string): Promise<ParsedTransactionWithMeta | null> {
    await this.ensureInitialized()
    const conn = this.connections.get(rpcUrl) || this.proxyConnections.get(rpcUrl) || new Connection(rpcUrl)
    
    try {
      return await conn.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })
    } catch (error) {
      this.logger.warn(`Failed to get transaction from ${rpcUrl}:`, error)
      return null
    }
  }

  async sendSplToken(
    toPublicKey: string,
    amount: number | string, // human-readable amount (e.g. "1.23" или 1.23)
    fromAddress: string, // sender public key (string)
    mintParam?: string | PublicKey,
    connectionParam?: Connection
  ): Promise<string> {
    await this.ensureInitialized()
    const conn = connectionParam ?? this.proxyConnection ?? this.fallbackConnection

    try {
      // --- resolve mint
      const mintAddrRaw = mintParam
        ? typeof mintParam === 'string'
          ? new PublicKey(mintParam)
          : mintParam
        : await this.coin.getMintAddress()
      const mint =
        typeof mintAddrRaw === 'string' ? new PublicKey(mintAddrRaw) : (mintAddrRaw as PublicKey)

      // --- fetch decimals
      let decimals = 0
      try {
        const supply = await this.executeWithRetry(conn => conn.getTokenSupply(mint))
        decimals = supply?.value?.decimals ?? 0
      } catch (err) {
        this.logger.warn('Failed to fetch token supply/decimals, defaulting to 0', err)
        decimals = 0
      }

      // --- convert amount to raw BigInt
      const rawAmount = this.amountToRaw(amount, decimals)
      if (rawAmount <= 0n) throw new Error('Amount must be positive')

      // --- resolve keypair (local signer)
      const keypair: Keypair = await this.wallet.getKeypair()
      const senderPub = keypair.publicKey
      const sender = new PublicKey(fromAddress)

      if (!sender.equals(senderPub)) {
        this.logger.warn('fromAddress does not equal wallet.getKeypair().publicKey')
      }

      const receiver = new PublicKey(toPublicKey)

      // --- ATA addresses
      const senderTokenAccount = await getAssociatedTokenAddress(mint, sender)
      const receiverTokenAccount = await getAssociatedTokenAddress(mint, receiver)

      // --- check sender token account / balance
      let senderBalanceRaw = 0n
      try {
        const balanceResp = await this.executeWithRetry(conn => conn.getTokenAccountBalance(senderTokenAccount))
        senderBalanceRaw = BigInt(balanceResp?.value?.amount ?? '0')
      } catch (err) {
        // if account doesn't exist or failed, treat as zero
        senderBalanceRaw = 0n
      }

      if (senderBalanceRaw < rawAmount) {
        throw new Error('Insufficient token balance')
      }

      // --- build instructions: create receiver ATA if missing
      const instructions: any[] = []
      const receiverInfo = await this.executeWithRetry(conn => conn.getAccountInfo(receiverTokenAccount))
      if (!receiverInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            sender, // payer
            receiverTokenAccount,
            receiver,
            mint
          )
        )
      }

      // transfer instruction; createTransferInstruction accepts BigInt in latest versions
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          receiverTokenAccount,
          sender,
          rawAmount, // BigInt
          []
        )
      )

      // --- prepare transaction
      const tx = new Transaction()
      tx.add(...instructions)

      const { blockhash, lastValidBlockHeight } = await this.getBlockhashWithRetry()
      tx.recentBlockhash = blockhash
      tx.feePayer = sender

      // --- signer: local keypair
      tx.sign(keypair) // signs with keypair; if need multiple signers, add here

      // --- send raw tx
      const signedRaw = tx.serialize()
      const signature = await this.executeWithRetry(conn => conn.sendRawTransaction(signedRaw))

      this.logger.log('Transaction signature:', signature)

      // --- confirm (finalized)
      await this.executeWithRetry(conn => conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized'))

      this.logger.log('Transaction confirmed', signature)
      return signature
    } catch (err) {
      this.logger.error('Failed to send SPL token:', err)
      throw err
    }
  }

  private async confirmTransaction(
    signature: string
  ): Promise<RpcResponseAndContext<SignatureResult> | null> {
    await this.ensureInitialized()
    try {
      const confirmation = await this.executeWithRetry(conn => 
        conn.confirmTransaction(signature, 'confirmed')
      )
      return confirmation
    } catch (e) {
      this.logger.warn(
        `Transaction confirmation failed, but transaction may still be processed:`,
        e
      )
      return null
    }
  }

  private async getBlockhashWithRetry(
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    await this.ensureInitialized()
    return this.executeWithRetry(conn => 
      conn.getLatestBlockhash('finalized')
    )
  }

  async getBalance(address?: string): Promise<{ sol: number; usdt: number; coin: number }> {
    if (!address) return { sol: 0, usdt: 0, coin: 0 }
    await this.ensureInitialized()

    const [solBalance, usdtBalance, coinBalance] = await Promise.all([
      this.getSolBalance(address),
      this.getUsdtBalance(address),
      this.getCoinBalance(address),
    ])

    return { sol: solBalance, usdt: usdtBalance, coin: coinBalance }
  }

  private async getSolBalance(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const pub = new PublicKey(address)
      const lamports = await this.executeWithRetry(conn => 
        conn.getBalance(pub, 'confirmed')
      )

      return lamports / LAMPORTS_PER_SOL
    } catch (e) {
      this.logger.error(`getSolBalance failed for ${address}`, e as any)
      return 0
    }
  }

  async getParsedTokenBalanceByMint(address: string, mint: PublicKey): Promise<number> {
    await this.ensureInitialized()
    this.logger.log(`[GET TOKEN BALANCE] Fetching balance for address: ${address}, mint: ${mint.toBase58()}`)
    
    try {
      const owner = new PublicKey(address)

      this.logger.log(`[GET TOKEN BALANCE] Querying token accounts...`)
      this.logger.log(`[GET TOKEN BALANCE] Owner PublicKey: ${owner.toBase58()}`)
      this.logger.log(`[GET TOKEN BALANCE] Mint PublicKey: ${mint.toBase58()}`)
      
      const resp = await this.executeWithRetry(conn => {
        this.logger.log(`[GET TOKEN BALANCE] Inside executeWithRetry, calling getParsedTokenAccountsByOwner...`)
        return conn.getParsedTokenAccountsByOwner(owner, { mint })
      })

      this.logger.log(`[GET TOKEN BALANCE] Response received, accounts found: ${resp?.value?.length || 0}`)

      if (!resp || !resp.value || resp.value.length === 0) {
        this.logger.warn(`[GET TOKEN BALANCE] No token accounts found for this mint`)
        return 0
      }

      let total = 0
      for (const item of resp.value) {
        try {
          const parsed = (item.account.data as any).parsed
          const tokenInfo = parsed?.info?.tokenAmount
          
          this.logger.log(`[GET TOKEN BALANCE] Parsing token account, tokenInfo:`, JSON.stringify(tokenInfo))
          
          if (!tokenInfo) continue

          if (typeof tokenInfo.uiAmount === 'number' && tokenInfo.uiAmount !== null) {
            total += tokenInfo.uiAmount
          } else {
            const amountRaw = Number(tokenInfo.amount || 0)
            const decimals = Number(tokenInfo.decimals || 0)
            if (decimals >= 0) {
              total += amountRaw / Math.pow(10, decimals)
            } else {
              total += amountRaw
            }
          }
        } catch (inner) {
          this.logger.warn('[GET TOKEN BALANCE] Failed to parse token account:', inner)
        }
      }

      this.logger.log(`[GET TOKEN BALANCE] Total balance calculated: ${total}`)
      return total
    } catch (e) {
      this.logger.error(
        `[GET TOKEN BALANCE] ERROR - Address: ${address}, Mint: ${mint.toBase58()}`,
        e
      )
      this.logger.error(`[GET TOKEN BALANCE] Error details:`, e)
      this.logger.error(`[GET TOKEN BALANCE] Error message:`, e?.message || 'No message')
      this.logger.error(`[GET TOKEN BALANCE] Error stack:`, e?.stack || 'No stack')
      return 0
    }
  }

  // --- USDT balance (reads mint from config or fallback to canonical mainnet mint)
  private async getUsdtBalance(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const usdtMintStr =
        this.config.get<string>('USDT_MINT') || 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' // official USDT mint on Solana mainnet
      const usdtMint = new PublicKey(usdtMintStr)
      return await this.getParsedTokenBalanceByMint(address, usdtMint)
    } catch (e) {
      this.logger.error(`getUsdtBalance failed for ${address}`, e as any)
      return 0
    }
  }

  // --- coin SPL token balance (mint from coin service)
  private async getCoinBalance(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const mintAddress = await this.coin.getMintAddress()
      const mint = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress

      return await this.getParsedTokenBalanceByMint(address, mint)
    } catch (e) {
      this.logger.error(`getCoinBalance failed for ${address}`, e as any)
      return 0
    }
  }

  /**
   * Get endpoint health status
   */
  getEndpointHealth() {
    return this.endpointManager.getHealthStatus()
  }

  /**
   * Get endpoint statistics
   */
  getEndpointStats() {
    return this.endpointManager.getStats()
  }

  /**
   * Reset all endpoints to healthy state
   */
  resetEndpoints() {
    this.endpointManager.resetAll()
    this.logger.log('All endpoints reset to healthy state')
  }

  /**
   * Get current rate limiter status
   */
  async getLimiterStatus() {
    return {
      read: {
        queued: this.readLimiter.queued(),
        running: this.readLimiter.running(),
      },
      write: {
        queued: this.writeLimiter.queued(),
        running: this.writeLimiter.running(),
      },
    }
  }

  /**
   * Convert human-readable amount to raw BigInt
   */
  private amountToRaw(amount: number | string, decimals: number): bigint {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount')
    }
    
    const multiplier = Math.pow(10, decimals)
    const rawAmount = Math.floor(numAmount * multiplier)
    return BigInt(rawAmount)
  }
}
