import { Controller, Get, Put, Body } from '@nestjs/common'
import { SettingsService } from './settings.service'
import type { SettingsData, PublicSettingsData } from './settings.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../auth/constants/roles.constant'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getSettings(): Promise<SettingsData> {
    return this.settingsService.getSettings()
  }

  @Auth({ public: true })
  @Get('public')
  async getPublicSettings(): Promise<PublicSettingsData> {
    return this.settingsService.getPublicSettings()
  }

  @Put()
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async updateSettings(@Body() settings: SettingsData): Promise<SettingsData> {
    return this.settingsService.updateSettings(settings)
  }
}