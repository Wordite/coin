import { Injectable, Inject, forwardRef, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CoinStatus } from '@prisma/client'
import { RedisService } from '../redis/redis.service'
import { WalletService } from '../wallet/wallet.service'

export interface CoinPresaleSettings {
  totalAmount: number
  stage: number
  soldAmount: number
  currentAmount: number
  status: CoinStatus
  name: string
  decimals: number
  minBuyAmount: number
  maxBuyAmount: number
  mintAddress?: string
  rpc?: string
  rpcEndpoints?: Array<{ url: string; priority: number; name: string }>
}

@Injectable()
export class CoinService {
  private logger = new Logger(CoinService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(forwardRef(() => WalletService))
    private readonly wallet: WalletService
  ) {
    this.logger.log(`[COIN SERVICE] Initialized`)
  }

  async getRpcUrl(): Promise<string> {
    const cacheKey = 'rpc_url'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return cached
    }

    const coin = await this.prisma.coin.findFirst()

    if (!coin) {
      throw new Error('Coin not found')
    }

    await this.redis.setex(cacheKey, 120, coin.rpc)
    return coin.rpc
  }

  async getMintAddress(): Promise<string> {
    console.log('[GET MINT ADDRESS] Fetching mint address from settings')
    
    const coin = await this.prisma.coin.findFirst()
    const cacheKey = 'mint_address'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      console.log(`[GET MINT ADDRESS] Mint address from cache: ${cached}`)
      return cached
    }

    if (!coin || !coin.mintAddress) {
      console.error('[GET MINT ADDRESS] Mint address not configured in settings')
      throw new Error('Mint address not configured')
    }

    console.log(`[GET MINT ADDRESS] Mint address: ${coin.mintAddress}`)
    await this.redis.setex(cacheKey, 120, coin.mintAddress)
    return coin.mintAddress
  }

  async getPresaleSettings(): Promise<CoinPresaleSettings> {
    const cacheKey = 'presale_settings'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      console.log(`[GET PRESALE SETTINGS] Using cached data`)
      return JSON.parse(cached)
    }

    console.log(`[GET PRESALE SETTINGS] Cache miss, fetching from database`)

    let coin = await this.prisma.coin.findFirst()

    if (!coin) {
      coin = await this.prisma.coin.create({
        data: {
          totalAmount: 1000000,
          stage: 1,
          soldAmount: 0,
          currentAmount: 0,
          status: CoinStatus.PRESALE,
          name: 'Coin',
          decimals: 6,
          minBuyAmount: 100,
          maxBuyAmount: 1000000,
        },
      })
    }

    const settings = {
      totalAmount: coin.totalAmount,
      stage: coin.stage,
      soldAmount: coin.soldAmount,
      currentAmount: coin.currentAmount,
      status: coin.status,
      name: coin.name,
      decimals: coin.decimals,
      minBuyAmount: coin.minBuyAmount,
      maxBuyAmount: coin.maxBuyAmount,
      mintAddress: coin.mintAddress || undefined,
      rpc: coin.rpc,
      rpcEndpoints: coin.rpcEndpoints as Array<{ url: string; priority: number; name: string }> || [],
    }

    console.log(`[GET PRESALE SETTINGS] Setting cache with fresh data`)
    await this.redis.setex(cacheKey, 900, JSON.stringify(settings))

    return settings
  }

  async updatePresaleSettings(
    settings: Partial<CoinPresaleSettings>
  ): Promise<CoinPresaleSettings> {
    const existingCoin = await this.prisma.coin.findFirst()

    let result: CoinPresaleSettings

    if (existingCoin) {
      // Calculate new values
      const newTotalAmount = settings.totalAmount ?? existingCoin.totalAmount
      const newSoldAmount = settings.soldAmount ?? existingCoin.soldAmount
      // Always recalculate currentAmount when totalAmount or soldAmount changes
      const newCurrentAmount = newTotalAmount - newSoldAmount

      // Update existing coin settings
      const updated = await this.prisma.coin.update({
        where: { id: existingCoin.id },
        data: {
          totalAmount: newTotalAmount,
          stage: settings.stage ?? existingCoin.stage,
          soldAmount: newSoldAmount,
          currentAmount: newCurrentAmount,
          status: settings.status ?? existingCoin.status,
          name: settings.name ?? existingCoin.name,
          decimals: settings.decimals ?? existingCoin.decimals,
          minBuyAmount: settings.minBuyAmount ?? existingCoin.minBuyAmount,
          maxBuyAmount: settings.maxBuyAmount ?? existingCoin.maxBuyAmount,
          mintAddress: settings.mintAddress ?? existingCoin.mintAddress,
          rpc: settings.rpc ?? existingCoin.rpc,
          rpcEndpoints: settings.rpcEndpoints ? JSON.parse(JSON.stringify(settings.rpcEndpoints)) : existingCoin.rpcEndpoints,
        },
      })

      result = {
        totalAmount: newTotalAmount,
        stage: updated.stage,
        soldAmount: newSoldAmount,
        currentAmount: newCurrentAmount,
        status: updated.status,
        name: updated.name,
        decimals: updated.decimals,
        minBuyAmount: updated.minBuyAmount,
        maxBuyAmount: updated.maxBuyAmount,
        mintAddress: updated.mintAddress || undefined,
        rpc: updated.rpc,
        rpcEndpoints: updated.rpcEndpoints as Array<{ url: string; priority: number; name: string }> || [],
      }
    } else {
      // Create new coin settings
      const created = await this.prisma.coin.create({
        data: {
          totalAmount: settings.totalAmount ?? 1000000,
          stage: settings.stage ?? 1,
          soldAmount: settings.soldAmount ?? 0,
          currentAmount: settings.currentAmount ?? 0,
          status: settings.status ?? 'PRESALE',
          name: settings.name ?? 'Coin',
          decimals: settings.decimals ?? 6,
          minBuyAmount: settings.minBuyAmount ?? 100,
          maxBuyAmount: settings.maxBuyAmount ?? 1000000,
          mintAddress: settings.mintAddress ?? null,
        },
      })

      result = {
        totalAmount: created.totalAmount,
        stage: created.stage,
        soldAmount: created.soldAmount,
        currentAmount: created.currentAmount,
        status: created.status,
        name: created.name,
        decimals: created.decimals,
        minBuyAmount: created.minBuyAmount,
        maxBuyAmount: created.maxBuyAmount,
        mintAddress: created.mintAddress || undefined,
      }
    }

    const cacheKey = 'presale_settings'
    // Invalidate cache so next read will fetch fresh data
    console.log(`[CACHE INVALIDATION] Deleting cache key: ${cacheKey}`)
    await this.redis.del(cacheKey)
    console.log(`[CACHE INVALIDATION] Cache deleted successfully`)

    return result
  }

  async getAvailableStages(): Promise<number[]> {
    // Return available stage numbers (you can customize this logic)
    return [1, 2, 3, 4, 5]
  }

  async getRateLimits(): Promise<{ readLimit: number; writeLimit: number }> {
    const cacheKey = 'rate_limits'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      this.logger.log(`[GET RATE LIMITS] Using cached data: ${cached}`)
      return JSON.parse(cached)
    }

    this.logger.log(`[GET RATE LIMITS] Cache miss, fetching from database`)
    const coin = await this.prisma.coin.findFirst()

    if (!coin) {
      this.logger.error(`[GET RATE LIMITS] Coin not found in database`)
      throw new Error('Coin not found')
    }

    this.logger.log(`[GET RATE LIMITS] Found coin, readRateLimit: ${coin.readRateLimit}, writeRateLimit: ${coin.writeRateLimit}`)

    const rateLimits = {
      readLimit: coin.readRateLimit || 50,
      writeLimit: coin.writeRateLimit || 3,
    }

    await this.redis.setex(cacheKey, 120, JSON.stringify(rateLimits))
    this.logger.log(`[GET RATE LIMITS] Returning rate limits:`, rateLimits)
    return rateLimits
  }

  async getRpcEndpoints(): Promise<Array<{ url: string; priority: number; name: string }>> {
    const cacheKey = 'rpc_endpoints'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      this.logger.log(`[GET RPC ENDPOINTS] Using cached data: ${cached}`)
      return JSON.parse(cached)
    }

    this.logger.log(`[GET RPC ENDPOINTS] Cache miss, fetching from database`)
    const coin = await this.prisma.coin.findFirst()

    if (!coin) {
      this.logger.error(`[GET RPC ENDPOINTS] Coin not found in database`)
      throw new Error('Coin not found')
    }

    this.logger.log(`[GET RPC ENDPOINTS] Found coin, rpc: "${coin.rpc}", rpcEndpoints:`, coin.rpcEndpoints)

    // Build endpoints array: primary RPC + additional endpoints from JSON
    const endpoints: Array<{ url: string; priority: number; name: string }> = [
      {
        url: coin.rpc,
        priority: 1,
        name: 'Primary RPC',
      },
    ]

    // Add additional endpoints from rpcEndpoints JSON field
    if (coin.rpcEndpoints && typeof coin.rpcEndpoints === 'object') {
      try {
        const additionalEndpoints = coin.rpcEndpoints as Array<{ url: string; priority: number; name: string }>
        if (Array.isArray(additionalEndpoints)) {
          endpoints.push(...additionalEndpoints)
          this.logger.log(`[GET RPC ENDPOINTS] Added ${additionalEndpoints.length} additional endpoints`)
        }
      } catch (err) {
        // If JSON parsing fails, just use the primary RPC
        this.logger.warn('[GET RPC ENDPOINTS] Failed to parse rpcEndpoints JSON:', err)
      }
    }

    this.logger.log(`[GET RPC ENDPOINTS] Final endpoints array:`, endpoints)
    await this.redis.setex(cacheKey, 120, JSON.stringify(endpoints))
    return endpoints
  }


  async getCurrentAvailableAmount(): Promise<number> {
    const coin = await this.prisma.coin.findFirst()

    if (!coin) {
      throw new Error('Coin not found')
    }

    // Get current amount from database
    const dbAmount = coin.totalAmount - coin.soldAmount

    // Get wallet balance from WalletService
    const walletBalance = await this.wallet.getCoinBalance()

    // Return the minimum of database amount and wallet balance
    const availableAmount = Math.min(dbAmount, walletBalance)

    console.log(`[AVAILABLE AMOUNT] DB: ${dbAmount}, Wallet: ${walletBalance}, Available: ${availableAmount}`)

    return availableAmount
  }

  async updateRpcEndpoints(endpoints: Array<{ url: string; priority: number; name: string }>): Promise<Array<{ url: string; priority: number; name: string }>> {
    const coin = await this.prisma.coin.findFirst()

    if (!coin) {
      throw new Error('Coin not found')
    }

    await this.prisma.coin.update({
      where: { id: coin.id },
      data: {
        rpcEndpoints: JSON.parse(JSON.stringify(endpoints)),
      },
    })

    // Invalidate cache
    await this.redis.del('presale_settings')

    return endpoints
  }

  async clearPresaleSettingsCache(): Promise<void> {
    await this.redis.del('presale_settings')
  }

  async isSoldOut(): Promise<boolean> {
    const coin = await this.prisma.coin.findFirst()
    
    if (!coin) {
      throw new Error('Coin not found')
    }
    
    const isSoldOut = coin.soldAmount >= coin.totalAmount
    this.logger.log(`[IS SOLD OUT] soldAmount: ${coin.soldAmount}, totalAmount: ${coin.totalAmount}, isSoldOut: ${isSoldOut}`)
    
    return isSoldOut
  }

  async updateSoldAmount(deltaAmount: number): Promise<void> {
    this.logger.log(`[UPDATE SOLD AMOUNT] Updating soldAmount by ${deltaAmount}`)
    
    const coin = await this.prisma.coin.findFirst()
    if (!coin) {
      throw new NotFoundException('Coin settings not found')
    }
    
    const newSoldAmount = Math.max(0, coin.soldAmount + deltaAmount)
    const newCurrentAmount = coin.totalAmount - newSoldAmount
    
    this.logger.log(`[UPDATE SOLD AMOUNT] Old soldAmount: ${coin.soldAmount}, New soldAmount: ${newSoldAmount}`)
    this.logger.log(`[UPDATE SOLD AMOUNT] Old currentAmount: ${coin.currentAmount}, New currentAmount: ${newCurrentAmount}`)
    
    await this.prisma.coin.update({
      where: { id: coin.id },
      data: { 
        soldAmount: newSoldAmount,
        currentAmount: newCurrentAmount
      }
    })
    
    // Invalidate cache
    const cacheKey = 'presale_settings'
    console.log(`[UPDATE SOLD AMOUNT] Deleting cache key: ${cacheKey}`)
    await this.redis.del(cacheKey)
    console.log(`[UPDATE SOLD AMOUNT] Cache deleted successfully`)
    
    this.logger.log(`[UPDATE SOLD AMOUNT] Successfully updated soldAmount and currentAmount`)
  }
}
