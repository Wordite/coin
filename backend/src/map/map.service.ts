import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name)

  constructor(private prisma: PrismaService) {}

  // ============================================
  // Map Settings
  // ============================================

  async getSettings() {
    let settings = await this.prisma.mapSettings.findFirst({
      include: {
        zones: true,
        markers: {
          include: {
            cards: true,
          },
        },
      },
    })

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.mapSettings.create({
        data: {
          title: 'Tycoin Land',
        },
        include: {
          zones: true,
          markers: {
            include: {
              cards: true,
            },
          },
        },
      })
    }

    return settings
  }

  async updateSettings(data: { title?: string }) {
    const settings = await this.getSettings()

    return this.prisma.mapSettings.update({
      where: { id: settings.id },
      data: {
        title: data.title,
      },
      include: {
        zones: true,
        markers: {
          include: {
            cards: true,
          },
        },
      },
    })
  }

  // ============================================
  // Zones
  // ============================================

  async createZone(data: {
    name: string
    x: number
    y: number
    fontSize?: number
    color?: string
  }) {
    const settings = await this.getSettings()

    return this.prisma.mapZone.create({
      data: {
        name: data.name,
        x: data.x,
        y: data.y,
        fontSize: data.fontSize || 1.5,
        color: data.color || '#ffffff',
        mapSettingsId: settings.id,
      },
    })
  }

  async updateZone(
    id: string,
    data: {
      name?: string
      x?: number
      y?: number
      fontSize?: number
      color?: string
    },
  ) {
    return this.prisma.mapZone.update({
      where: { id },
      data,
    })
  }

  async deleteZone(id: string) {
    return this.prisma.mapZone.delete({
      where: { id },
    })
  }

  // ============================================
  // Markers
  // ============================================

  async createMarker(data: {
    x: number
    y: number
    color?: string
    size?: number
    title?: string
  }) {
    const settings = await this.getSettings()

    return this.prisma.mapMarker.create({
      data: {
        x: data.x,
        y: data.y,
        color: data.color || '#ff3333',
        size: data.size || 0.12,
        title: data.title,
        mapSettingsId: settings.id,
      },
      include: {
        cards: true,
      },
    })
  }

  async updateMarker(
    id: string,
    data: {
      x?: number
      y?: number
      color?: string
      size?: number
      title?: string
    },
  ) {
    return this.prisma.mapMarker.update({
      where: { id },
      data,
      include: {
        cards: true,
      },
    })
  }

  async deleteMarker(id: string) {
    return this.prisma.mapMarker.delete({
      where: { id },
    })
  }

  // ============================================
  // Marker Cards
  // ============================================

  async createMarkerCard(
    markerId: string,
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ) {
    return this.prisma.mapMarkerCard.create({
      data: {
        photo: data.photo,
        title: data.title,
        description: data.description,
        apy: data.apy || 60,
        vip: data.vip || 'Gold',
        price: data.price || 1234,
        markerId,
      },
    })
  }

  async updateMarkerCard(
    id: string,
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ) {
    return this.prisma.mapMarkerCard.update({
      where: { id },
      data,
    })
  }

  async deleteMarkerCard(id: string) {
    return this.prisma.mapMarkerCard.delete({
      where: { id },
    })
  }
}
