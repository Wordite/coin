import { Controller, Get, Post, Body, Put, Req } from '@nestjs/common'
import { CoinService, CoinPresaleSettings } from './coin.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Roles } from 'src/auth/constants/roles.constant'
import { AntiSpamService } from 'src/anti-spam/anti-spam.service'
import type { Request } from 'express'

@Controller('coin')
export class CoinController {
  constructor(
    private readonly coinService: CoinService,
    private readonly antiSpamService: AntiSpamService
  ) {}

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('presale-settings')
  async getPresaleSettings(): Promise<CoinPresaleSettings> {
    return this.coinService.getPresaleSettings()
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Put('presale-settings')
  async updatePresaleSettings(
    @Body() settings: Partial<CoinPresaleSettings>
  ): Promise<CoinPresaleSettings> {
    return this.coinService.updatePresaleSettings(settings)
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('available-stages')
  async getAvailableStages(): Promise<number[]> {
    return this.coinService.getAvailableStages()
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Put('rpc-endpoints')
  async updateRpcEndpoints(
    @Body() body: { endpoints: Array<{ url: string; priority: number; name: string }> }
  ): Promise<{ success: boolean }> {
    await this.coinService.updateRpcEndpoints(body.endpoints)
    return { success: true }
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Post('clear-cache')
  async clearCache(): Promise<{ success: boolean }> {
    await this.coinService.clearPresaleSettingsCache()
    return { success: true }
  }

  @Auth({ public: true, fingerprint: true, antiSpam: true })
  @Post('public/receive')
  async publicReceive(
    @Body() body: { amount: number, coin: string },
    @Req() req: Request & { fingerprint: string }
  ) {
    const receive = await this.coinService.calculateReceive(body.amount, body.coin)

    this.antiSpamService.addPoints(req.fingerprint, 0.2, {
      reason: 'public_receive',
      amount: body.amount,
      coin: body.coin,
      ip: req.ip,
      ua: req.get('user-agent'),
      timestamp: Date.now()
    })

    return { receive }
  }

  @Auth({ public: true })
  @Get('public/presale-settings')
  async getPublicPresaleSettings() {
    const settings = await this.coinService.getPresaleSettings()

    return {
      stage: settings.stage,
      sold: settings.soldAmount,
      total: settings.totalAmount,
      name: settings.name,
      decimals: settings.decimals,
      minBuyAmount: settings.minBuyAmount,
      maxBuyAmount: settings.maxBuyAmount,
    }
  }
}
