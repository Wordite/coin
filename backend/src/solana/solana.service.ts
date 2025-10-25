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
  private directConnection: Connection // Non-rate-limited connection for admin UI
  private readonly fallbackConnection: Connection = new Connection(clusterApiUrl('mainnet-beta'))
  private logger = new Logger(SolanaService.name)

  private readLimiter: Bottleneck
  private writeLimiter: Bottleneck
  private endpointManager: EndpointManager
  private connections: Map<string, Connection> = new Map()
  private proxyConnections: Map<string, Connection> = new Map()
  private directConnections: Map<string, Connection> = new Map() // Non-rate-limited connections

  private isInitialized: Promise<void> | null = null
  private _resolveInitialized: (() => void) | null = null
  private queueMonitorInterval: NodeJS.Timeout | null = null

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

      // Detailed validation logging
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

        // Completely disable rate limiting for read operations
        this.readLimiter = new Bottleneck({
          id: 'solana-read-limiter-disabled',
          reservoir: 10000,
          reservoirRefreshAmount: 10000,
          reservoirRefreshInterval: 1,
          maxConcurrent: 1000,
          minTime: 0,
        })
        this.logger.log(`[SOLANA INIT] Redis-backed read limiter created successfully`)
      } catch (redisError) {
        this.logger.warn(`[SOLANA INIT] Redis not available, using local read limiter:`, redisError.message)
        // Completely disable rate limiting for read operations
        this.readLimiter = new Bottleneck({
          id: 'solana-read-limiter-disabled',
          reservoir: 10000,
          reservoirRefreshAmount: 10000,
          reservoirRefreshInterval: 1,
          maxConcurrent: 1000,
          minTime: 0,
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

        // Completely disable rate limiting for write operations
        this.writeLimiter = new Bottleneck({
          id: 'solana-write-limiter-disabled',
          reservoir: 10000,
          reservoirRefreshAmount: 10000,
          reservoirRefreshInterval: 1,
          maxConcurrent: 1000,
          minTime: 0,
        })
        this.logger.log(`[SOLANA INIT] Redis-backed write limiter created successfully`)
      } catch (redisError) {
        this.logger.warn(`[SOLANA INIT] Redis not available, using local write limiter:`, redisError.message)
        // Completely disable rate limiting for write operations
        this.writeLimiter = new Bottleneck({
          id: 'solana-write-limiter-disabled',
          reservoir: 10000,
          reservoirRefreshAmount: 10000,
          reservoirRefreshInterval: 1,
          maxConcurrent: 1000,
          minTime: 0,
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

          // Create direct (non-rate-limited) connection for admin UI
          this.directConnections.set(endpoint.url, connection)
          this.logger.log(`[SOLANA INIT] Direct connection created for: ${endpoint.url}`)

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
        this.directConnection = this.directConnections.get(primaryEndpoint.url)!
      } else {
        // Fallback to public RPC with rate limiting
        const fallbackProxy = makeProxyConnection(this.fallbackConnection, {
          readLimiter: this.readLimiter,
          writeLimiter: this.writeLimiter,
        })
        this.proxyConnection = fallbackProxy
        this.directConnection = this.fallbackConnection
      }

      // Start queue monitoring
      this.startQueueMonitoring()

      this._resolveInitialized?.()
      this.logger.log(`[SOLANA INIT] ✅ SolanaService initialized successfully with ${endpoints.length} endpoints and rate limits: ${rateLimits.readLimit} read/s, ${rateLimits.writeLimit} write/s`)
    } catch (error) {
      this.logger.error('[SOLANA INIT] ❌ Failed to initialize SolanaService:', error)
      this.logger.error('[SOLANA INIT] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        constructor: error?.constructor?.name
      })
      // Fallback to public RPC
      this.proxyConnection = this.fallbackConnection
      this._resolveInitialized?.()
    }
  }

  private async executeWithRetry<T>(
    operation: (conn: Connection) => Promise<T>,
    maxRetries: number = 4
  ): Promise<T> {
    this.logger.log(`[EXECUTE WITH RETRY] Starting executeWithRetry with maxRetries: ${maxRetries}`)
    await this.logQueueStatus('executeWithRetry')
    
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
    let currentEndpoint: RpcEndpoint | null = null
    let attemptsOnCurrentEndpoint = 0

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.log(`[EXECUTE WITH RETRY] Attempt ${attempt}/${maxRetries}`)
      
      // Get endpoint only if we don't have one or if we've exhausted attempts on current endpoint
      if (!currentEndpoint || attemptsOnCurrentEndpoint >= 4) {
        this.logger.log(`[EXECUTE WITH RETRY] Getting next endpoint...`)
        currentEndpoint = this.endpointManager.getNextEndpoint()
        attemptsOnCurrentEndpoint = 0
        
        if (!currentEndpoint) {
          this.logger.warn(`[EXECUTE WITH RETRY] No healthy endpoints available, resetting all endpoints...`)
          this.endpointManager.resetAll()
          currentEndpoint = this.endpointManager.getNextEndpoint()
          
          if (!currentEndpoint) {
            this.logger.error(`[EXECUTE WITH RETRY] No endpoints available even after reset, trying emergency reset...`)
            try {
              await this.resetAll()
              currentEndpoint = this.endpointManager.getNextEndpoint()
              
              if (!currentEndpoint) {
                this.logger.error(`[EXECUTE WITH RETRY] Emergency reset failed, no endpoints available`)
                throw new Error('No healthy endpoints available')
              }
            } catch (resetError) {
              this.logger.error(`[EXECUTE WITH RETRY] Emergency reset failed:`, resetError)
              throw new Error('No healthy endpoints available')
            }
          }
        }
        
        this.logger.log(`[EXECUTE WITH RETRY] Selected endpoint: ${currentEndpoint.url}`)
      }
      
      attemptsOnCurrentEndpoint++
      
      try {
        this.logger.log(`[EXECUTE WITH RETRY] Looking for connection in proxyConnections...`)
        this.logger.log(`[EXECUTE WITH RETRY] Available connections:`, Array.from(this.proxyConnections.keys()))
        
        const connection = this.proxyConnections.get(currentEndpoint.url)
        this.logger.log(`[EXECUTE WITH RETRY] Connection found:`, connection ? 'yes' : 'no')
        
        if (!connection) {
          this.logger.error(`[EXECUTE WITH RETRY] No connection found for endpoint: ${currentEndpoint.url}`)
          throw new Error(`No connection found for endpoint: ${currentEndpoint.url}`)
        }

        this.logger.log(`[EXECUTE WITH RETRY] Using endpoint: ${currentEndpoint.url} (attempt ${attemptsOnCurrentEndpoint}/4 on this endpoint)`)
        
        // Add timeout mechanism
        const result = await Promise.race([
          operation(connection),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout after 30 seconds')), 30000)
          )
        ])
        
        this.logger.log(`[EXECUTE WITH RETRY] Operation successful on attempt ${attempt}`)
        // Mark success
        this.endpointManager.markSuccess(currentEndpoint)
        return result
      } catch (error) {
        lastError = error
        
        // Mark failure for current endpoint
        this.endpointManager.markFailure(currentEndpoint, error)
        
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed on ${currentEndpoint.url} (${attemptsOnCurrentEndpoint}/4):`, error.message)

        if (attempt === maxRetries) {
          break
        }

        // Fixed 1-second delay (max 5 seconds total)
        const delay = 1000
        this.logger.log(`[EXECUTE WITH RETRY] Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // If all endpoints failed, try fallback
    this.logger.warn('[EXECUTE WITH RETRY] All configured endpoints failed, trying fallback connection...')
    try {
      const fallbackProxy = makeProxyConnection(this.fallbackConnection, {
        readLimiter: this.readLimiter,
        writeLimiter: this.writeLimiter,
      })
      
      // Add timeout to fallback as well
      const result = await Promise.race([
        operation(fallbackProxy),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Fallback operation timeout after 30 seconds')), 30000)
        )
      ])
      
      this.logger.log('[EXECUTE WITH RETRY] Fallback operation successful')
      return result
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

      // --- send raw tx (bypass rate limiting for write operations)
      const signedRaw = tx.serialize()
      const signature = await this.executeWriteWithoutLimiter(conn => conn.sendRawTransaction(signedRaw))

      this.logger.log('Transaction signature:', signature)

      // --- confirm (finalized) (bypass rate limiting for write operations)
      await this.executeWriteWithoutLimiter(conn => conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized'))

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
      const confirmation = await Promise.race([
        this.executeWriteWithoutLimiter(conn => 
          conn.confirmTransaction(signature, 'confirmed')
        ),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Confirmation timeout after 30 seconds')), 30000)
        )
      ])
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
        queued: await this.readLimiter.queued(),
        running: await this.readLimiter.running(),
      },
      write: {
        queued: await this.writeLimiter.queued(),
        running: await this.writeLimiter.running(),
      },
    }
  }

  /**
   * Force clear all queues (emergency reset)
   */
  async clearAllQueues(): Promise<void> {
    this.logger.warn('[QUEUE RESET] Force resetting all queues...')
    try {
      // Reset endpoints first
      this.endpointManager.resetAll()
      
      // Log current queue status
      const readQueued = await this.readLimiter.queued()
      const writeQueued = await this.writeLimiter.queued()
      this.logger.log(`[QUEUE RESET] Current status - Read: ${readQueued} queued, Write: ${writeQueued} queued`)
      
      this.logger.log('[QUEUE RESET] Queues will be cleared by endpoint reset')
    } catch (error) {
      this.logger.error('[QUEUE RESET] Failed to reset queues:', error)
      throw error
    }
  }

  /**
   * Reset all endpoints and clear queues
   */
  async resetAll(): Promise<void> {
    this.logger.warn('[SYSTEM RESET] Resetting all endpoints and clearing queues...')
    try {
      // Reset endpoints
      this.endpointManager.resetAll()
      
      // Clear queues
      await this.clearAllQueues()
      
      this.logger.log('[SYSTEM RESET] System reset completed successfully')
    } catch (error) {
      this.logger.error('[SYSTEM RESET] Failed to reset system:', error)
      throw error
    }
  }

  /**
   * Start periodic queue monitoring
   */
  private startQueueMonitoring(): void {
    this.queueMonitorInterval = setInterval(async () => {
      if (!this.readLimiter || !this.writeLimiter) {
        return
      }
      
      try {
        const readQueued = await this.readLimiter.queued()
        const readRunning = await this.readLimiter.running()
        const writeQueued = await this.writeLimiter.queued()
        const writeRunning = await this.writeLimiter.running()
        
        if (readQueued > 0 || writeQueued > 0 || readRunning > 0 || writeRunning > 0) {
          this.logger.log(`[QUEUE STATUS] Read: ${readQueued} queued, ${readRunning} running | Write: ${writeQueued} queued, ${writeRunning} running`)
          
          // If queue is stuck for too long, log warning
          if (readQueued > 10 && readRunning === 0) {
            this.logger.warn(`[QUEUE STATUS] Read queue appears stuck (${readQueued} queued, 0 running) - this may indicate RPC issues`)
          }
          
          if (writeQueued > 10 && writeRunning === 0) {
            this.logger.warn(`[QUEUE STATUS] Write queue appears stuck (${writeQueued} queued, 0 running) - this may indicate RPC issues`)
          }
        }
      } catch (error) {
        this.logger.warn(`[QUEUE STATUS] Error getting queue status:`, error)
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Stop queue monitoring
   */
  private stopQueueMonitoring(): void {
    if (this.queueMonitorInterval) {
      clearInterval(this.queueMonitorInterval)
      this.queueMonitorInterval = null
    }
  }

  /**
   * Get direct (non-rate-limited) connection for admin UI
   */
  async getDirectConnection(): Promise<Connection> {
    await this.ensureInitialized()
    return this.directConnection ?? this.fallbackConnection
  }

  /**
   * Execute write operation without rate limiting (emergency bypass)
   */
  private async executeWriteWithoutLimiter<T>(
    operation: (conn: Connection) => Promise<T>
  ): Promise<T> {
    await this.ensureInitialized()
    this.logger.log(`[WRITE BYPASS] Executing write operation without rate limiting`)
    
    // Use direct connection to bypass all rate limiting
    const connection = this.directConnection ?? this.fallbackConnection
    
    // Add timeout mechanism
    return await Promise.race([
      operation(connection),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Write operation timeout after 30 seconds')), 30000)
      )
    ])
  }

  /**
   * Get balance using direct connection (for admin UI)
   */
  async getBalanceDirect(address?: string): Promise<{ sol: number; usdt: number; coin: number }> {
    if (!address) return { sol: 0, usdt: 0, coin: 0 }
    await this.ensureInitialized()
    await this.logQueueStatus('getBalanceDirect')

    const [solBalance, usdtBalance, coinBalance] = await Promise.all([
      this.getSolBalanceDirect(address),
      this.getUsdtBalanceDirect(address),
      this.getCoinBalanceDirect(address),
    ])

    return { sol: solBalance, usdt: usdtBalance, coin: coinBalance }
  }

  /**
   * Get SOL balance using direct connection
   */
  private async getSolBalanceDirect(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const pub = new PublicKey(address)
      const lamports = await this.directConnection.getBalance(pub, 'confirmed')
      return lamports / LAMPORTS_PER_SOL
    } catch (e) {
      this.logger.error(`getSolBalanceDirect failed for ${address}`, e as any)
      return 0
    }
  }

  /**
   * Get USDT balance using direct connection
   */
  private async getUsdtBalanceDirect(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const usdtMintStr =
        this.config.get<string>('USDT_MINT') || 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      const usdtMint = new PublicKey(usdtMintStr)
      return await this.getParsedTokenBalanceByMintDirect(address, usdtMint)
    } catch (e) {
      this.logger.error(`getUsdtBalanceDirect failed for ${address}`, e as any)
      return 0
    }
  }

  /**
   * Get COIN balance using direct connection
   */
  private async getCoinBalanceDirect(address: string): Promise<number> {
    await this.ensureInitialized()
    try {
      const mintAddress = await this.coin.getMintAddress()
      const mint = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress
      return await this.getParsedTokenBalanceByMintDirect(address, mint)
    } catch (e) {
      this.logger.error(`getCoinBalanceDirect failed for ${address}`, e as any)
      return 0
    }
  }

  /**
   * Get parsed token balance by mint using direct connection (for admin UI)
   */
  async getParsedTokenBalanceByMintDirect(address: string, mint: PublicKey): Promise<number> {
    await this.ensureInitialized()
    this.logger.log(`[GET TOKEN BALANCE DIRECT] Fetching balance for address: ${address}, mint: ${mint.toBase58()}`)
    await this.logQueueStatus('getParsedTokenBalanceByMintDirect')
    
    try {
      const owner = new PublicKey(address)
      
      this.logger.log(`[GET TOKEN BALANCE DIRECT] Querying token accounts...`)
      this.logger.log(`[GET TOKEN BALANCE DIRECT] Owner PublicKey: ${owner.toBase58()}`)
      this.logger.log(`[GET TOKEN BALANCE DIRECT] Mint PublicKey: ${mint.toBase58()}`)
      
      const resp = await this.directConnection.getParsedTokenAccountsByOwner(owner, { mint })

      this.logger.log(`[GET TOKEN BALANCE DIRECT] Response received, accounts found: ${resp?.value?.length || 0}`)

      if (!resp || !resp.value || resp.value.length === 0) {
        this.logger.warn(`[GET TOKEN BALANCE DIRECT] No token accounts found for this mint`)
        return 0
      }

      let total = 0
      for (const item of resp.value) {
        try {
          const parsed = (item.account.data as any).parsed
          const tokenInfo = parsed?.info?.tokenAmount
          
          this.logger.log(`[GET TOKEN BALANCE DIRECT] Parsing token account, tokenInfo:`, JSON.stringify(tokenInfo))
          
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
          this.logger.warn('[GET TOKEN BALANCE DIRECT] Failed to parse token account:', inner)
        }
      }

      this.logger.log(`[GET TOKEN BALANCE DIRECT] Total balance calculated: ${total}`)
      return total
    } catch (e) {
      this.logger.error(
        `[GET TOKEN BALANCE DIRECT] ERROR - Address: ${address}, Mint: ${mint.toBase58()}`,
        e
      )
      this.logger.error(`[GET TOKEN BALANCE DIRECT] Error details:`, e)
      this.logger.error(`[GET TOKEN BALANCE DIRECT] Error message:`, e?.message || 'No message')
      this.logger.error(`[GET TOKEN BALANCE DIRECT] Error stack:`, e?.stack || 'No stack')
      return 0
    }
  }

  /**
   * Log current queue status
   */
  private async logQueueStatus(operation: string): Promise<void> {
    if (!this.readLimiter || !this.writeLimiter) {
      this.logger.log(`[QUEUE STATUS] ${operation} - Limiters not initialized yet`)
      return
    }
    
    try {
      const readQueued = await this.readLimiter.queued()
      const readRunning = await this.readLimiter.running()
      const writeQueued = await this.writeLimiter.queued()
      const writeRunning = await this.writeLimiter.running()
      
      this.logger.log(`[QUEUE STATUS] ${operation} - Read: ${readQueued} queued, ${readRunning} running | Write: ${writeQueued} queued, ${writeRunning} running`)
    } catch (error) {
      this.logger.warn(`[QUEUE STATUS] ${operation} - Error getting queue status:`, error)
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
