import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'

export interface SettingsData {
  // Site Settings
  siteName: string
  siteLogo: string
  siteDescription: string

  // Presale Settings
  presaleEndDateTime: string // ISO string format
  presaleActive: boolean

  // Exchange Rates
  usdtToCoinRate: number
  solToCoinRate: number

  // Receiver Wallet (for payments)
  receiverWalletPublicKey: string
}

export interface PublicSettingsData {
  // Site Settings
  siteName: string
  siteLogo: string
  siteDescription: string
  
  // Presale Settings
  presaleEndTime: number // seconds until presale ends
  presaleActive: boolean
  
  // Exchange Rates
  usdtToCoinRate: number
  solToCoinRate: number
}

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async getSettings(): Promise<SettingsData> {
    const cacheKey = 'settings'
    const cached = await this.redis.get(cacheKey)
  
    if (cached) {
      return JSON.parse(cached)
    }
    
    let settings = await this.prisma.settings.findFirst()
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          siteName: 'CryptoHomayak',
          siteLogo: '',
          siteDescription: 'Revolutionary cryptocurrency platform',
          presaleEndDateTime: null,
          presaleActive: false,
          usdtToCoinRate: 0.001,
          solToCoinRate: 0.0001,
          receiverWalletPublicKey: null,
        }
      })
    }

    const result = {
      siteName: settings.siteName,
      siteLogo: settings.siteLogo || '',
      siteDescription: settings.siteDescription || '',
      presaleEndDateTime: settings.presaleEndDateTime?.toISOString() || '',
      presaleActive: settings.presaleActive,
      usdtToCoinRate: settings.usdtToCoinRate,
      solToCoinRate: settings.solToCoinRate,
      receiverWalletPublicKey: settings.receiverWalletPublicKey || '',
    }
    
    await this.redis.setex(cacheKey, 900, JSON.stringify(result))
    
    return result
  }

  async updateSettings(settingsData: SettingsData): Promise<SettingsData> {
    const existingSettings = await this.prisma.settings.findFirst()
    
    let result: SettingsData
    
    if (existingSettings) {
      const updated = await this.prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          siteName: settingsData.siteName,
          siteLogo: settingsData.siteLogo,
          siteDescription: settingsData.siteDescription,
          presaleEndDateTime: settingsData.presaleEndDateTime ? new Date(settingsData.presaleEndDateTime) : null,
          presaleActive: settingsData.presaleActive,
          usdtToCoinRate: settingsData.usdtToCoinRate,
          solToCoinRate: settingsData.solToCoinRate,
          receiverWalletPublicKey: settingsData.receiverWalletPublicKey || null,
        }
      })

      result = {
        siteName: updated.siteName,
        siteLogo: updated.siteLogo || '',
        siteDescription: updated.siteDescription || '',
        presaleEndDateTime: updated.presaleEndDateTime?.toISOString() || '',
        presaleActive: updated.presaleActive,
        usdtToCoinRate: updated.usdtToCoinRate,
        solToCoinRate: updated.solToCoinRate,
        receiverWalletPublicKey: updated.receiverWalletPublicKey || '',
      }
    } else {
      // Create new settings
      const created = await this.prisma.settings.create({
        data: {
          siteName: settingsData.siteName,
          siteLogo: settingsData.siteLogo,
          siteDescription: settingsData.siteDescription,
          presaleEndDateTime: settingsData.presaleEndDateTime ? new Date(settingsData.presaleEndDateTime) : null,
          presaleActive: settingsData.presaleActive,
          usdtToCoinRate: settingsData.usdtToCoinRate,
          solToCoinRate: settingsData.solToCoinRate,
          receiverWalletPublicKey: settingsData.receiverWalletPublicKey || null,
        }
      })

      result = {
        siteName: created.siteName,
        siteLogo: created.siteLogo || '',
        siteDescription: created.siteDescription || '',
        presaleEndDateTime: created.presaleEndDateTime?.toISOString() || '',
        presaleActive: created.presaleActive,
        usdtToCoinRate: created.usdtToCoinRate,
        solToCoinRate: created.solToCoinRate,
        receiverWalletPublicKey: created.receiverWalletPublicKey || '',
      }
    }
    
    const cacheKey = 'settings'
    await this.redis.setex(cacheKey, 900, JSON.stringify(result))
    
    return result
  }

  async getReceiverWalletPublicKey(): Promise<string | null> {
    const settings = await this.getSettings()
    return settings.receiverWalletPublicKey || null
  }

  async getPublicSettings(): Promise<PublicSettingsData> {
    const settings = await this.getSettings()
    
    // Calculate seconds until presale ends
    let secondsUntilEnd = 0
    if (settings.presaleEndDateTime) {
      const endDateTime = new Date(settings.presaleEndDateTime)
      const now = new Date()
      const diffInSeconds = Math.max(0, Math.floor((endDateTime.getTime() - now.getTime()) / 1000))
      secondsUntilEnd = diffInSeconds
    }
    
    return {
      siteName: settings.siteName,
      siteLogo: settings.siteLogo,
      siteDescription: settings.siteDescription,
      presaleEndTime: secondsUntilEnd,
      presaleActive: settings.presaleActive,
      usdtToCoinRate: settings.usdtToCoinRate,
      solToCoinRate: settings.solToCoinRate,
    }
  }
}