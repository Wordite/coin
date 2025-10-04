import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoinStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

export interface CoinPresaleSettings {
  totalAmount: number;
  stage: number;
  soldAmount: number;
  currentAmount: number;
  status: CoinStatus;
  name: string;
  decimals: number;
  minBuyAmount: number;
  maxBuyAmount: number;
  mintAddress?: string;
}

@Injectable()
export class CoinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async getPresaleSettings(): Promise<CoinPresaleSettings> {
    const cacheKey = 'presale_settings'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    let coin = await this.prisma.coin.findFirst();
    
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
        }
      });
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
    }
    
    await this.redis.setex(cacheKey, 900, JSON.stringify(settings))
    
    return settings
  }

  async updatePresaleSettings(settings: Partial<CoinPresaleSettings>): Promise<CoinPresaleSettings> {
    const existingCoin = await this.prisma.coin.findFirst();
    
    let result: CoinPresaleSettings;
    
    if (existingCoin) {
      // Update existing coin settings
      const updated = await this.prisma.coin.update({
        where: { id: existingCoin.id },
        data: {
          totalAmount: settings.totalAmount ?? existingCoin.totalAmount,
          stage: settings.stage ?? existingCoin.stage,
          soldAmount: settings.soldAmount ?? existingCoin.soldAmount,
          currentAmount: settings.currentAmount ?? existingCoin.currentAmount,
          status: settings.status ?? existingCoin.status,
          name: settings.name ?? existingCoin.name,
          decimals: settings.decimals ?? existingCoin.decimals,
          minBuyAmount: settings.minBuyAmount ?? existingCoin.minBuyAmount,
          maxBuyAmount: settings.maxBuyAmount ?? existingCoin.maxBuyAmount,
          mintAddress: settings.mintAddress ?? existingCoin.mintAddress,
        }
      });
      
      result = {
        totalAmount: updated.totalAmount,
        stage: updated.stage,
        soldAmount: updated.soldAmount,
        currentAmount: updated.currentAmount,
        status: updated.status,
        name: updated.name,
        decimals: updated.decimals,
        minBuyAmount: updated.minBuyAmount,
        maxBuyAmount: updated.maxBuyAmount,
        mintAddress: updated.mintAddress || undefined,
      };
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
        }
      });
      
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
      };
    }
    
    const cacheKey = 'presale_settings'
    await this.redis.setex(cacheKey, 900, JSON.stringify(result))
    
    return result
  }

  async getAvailableStages(): Promise<number[]> {
    // Return available stage numbers (you can customize this logic)
    return [1, 2, 3, 4, 5];
  }
}
