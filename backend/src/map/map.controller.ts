import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { MapService } from './map.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  // ============================================
  // Public endpoint for app to fetch settings
  // ============================================

  @Get('settings')
  async getSettings() {
    return this.mapService.getSettings()
  }

  // ============================================
  // Admin endpoints
  // ============================================

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateSettings(@Body() data: { title?: string }) {
    return this.mapService.updateSettings(data)
  }

  // Zones
  @Post('zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createZone(
    @Body()
    data: {
      name: string
      x: number
      y: number
      fontSize?: number
      color?: string
    },
  ) {
    return this.mapService.createZone(data)
  }

  @Put('zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateZone(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string
      x?: number
      y?: number
      fontSize?: number
      color?: string
    },
  ) {
    return this.mapService.updateZone(id, data)
  }

  @Delete('zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteZone(@Param('id') id: string) {
    return this.mapService.deleteZone(id)
  }

  // Markers
  @Post('markers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createMarker(
    @Body()
    data: {
      x: number
      y: number
      color?: string
      size?: number
      title?: string
    },
  ) {
    return this.mapService.createMarker(data)
  }

  @Put('markers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateMarker(
    @Param('id') id: string,
    @Body()
    data: {
      x?: number
      y?: number
      color?: string
      size?: number
      title?: string
    },
  ) {
    return this.mapService.updateMarker(id, data)
  }

  @Delete('markers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteMarker(@Param('id') id: string) {
    return this.mapService.deleteMarker(id)
  }

  // Marker Cards
  @Post('markers/:markerId/cards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createMarkerCard(
    @Param('markerId') markerId: string,
    @Body()
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ) {
    return this.mapService.createMarkerCard(markerId, data)
  }

  @Put('cards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateMarkerCard(
    @Param('id') id: string,
    @Body()
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ) {
    return this.mapService.updateMarkerCard(id, data)
  }

  @Delete('cards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteMarkerCard(@Param('id') id: string) {
    return this.mapService.deleteMarkerCard(id)
  }
}
