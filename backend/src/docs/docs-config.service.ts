import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface DocsConfigData {
  // Основные настройки сайта
  title: string
  tagline: string
  
  // Настройки навигации
  navbarTitle: string
  logoSrc: string
  
  // Настройки карточек на главной странице
  feature1Title?: string
  feature1Text?: string
  feature1Image?: string
  
  feature2Title?: string
  feature2Text?: string
  feature2Image?: string
  
  feature3Title?: string
  feature3Text?: string
  feature3Image?: string
  
  // Настройки кнопки
  buttonText: string
  buttonLink: string
}

@Injectable()
export class DocsConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocsConfig(): Promise<DocsConfigData> {
    let config = await this.prisma.docsConfig.findFirst()
    
    if (!config) {
      // Создаем конфигурацию по умолчанию если не существует
      config = await this.prisma.docsConfig.create({
        data: {
          title: 'My Site',
          tagline: 'Dinosaurs are cool',
          navbarTitle: 'My Site',
          navbarLogoSrc: 'img/logo.svg',
          buttonText: 'Read More',
          buttonLink: '/docs'
        }
      })
    }

    return {
      title: config.title,
      tagline: config.tagline,
      navbarTitle: config.navbarTitle,
      logoSrc: config.navbarLogoSrc,
      feature1Title: config.feature1Title || undefined,
      feature1Text: config.feature1Text || undefined,
      feature1Image: config.feature1Image || undefined,
      feature2Title: config.feature2Title || undefined,
      feature2Text: config.feature2Text || undefined,
      feature2Image: config.feature2Image || undefined,
      feature3Title: config.feature3Title || undefined,
      feature3Text: config.feature3Text || undefined,
      feature3Image: config.feature3Image || undefined,
      buttonText: config.buttonText,
      buttonLink: config.buttonLink
    }
  }

  async updateDocsConfig(configData: DocsConfigData): Promise<DocsConfigData> {
    const existingConfig = await this.prisma.docsConfig.findFirst()
    
    if (existingConfig) {
      await this.prisma.docsConfig.update({
        where: { id: existingConfig.id },
        data: {
          title: configData.title,
          tagline: configData.tagline,
          navbarTitle: configData.navbarTitle,
          navbarLogoSrc: configData.logoSrc,
          feature1Title: configData.feature1Title || null,
          feature1Text: configData.feature1Text || null,
          feature1Image: configData.feature1Image || null,
          feature2Title: configData.feature2Title || null,
          feature2Text: configData.feature2Text || null,
          feature2Image: configData.feature2Image || null,
          feature3Title: configData.feature3Title || null,
          feature3Text: configData.feature3Text || null,
          feature3Image: configData.feature3Image || null,
          buttonText: configData.buttonText,
          buttonLink: configData.buttonLink
        }
      })
    } else {
      await this.prisma.docsConfig.create({
        data: {
          title: configData.title,
          tagline: configData.tagline,
          navbarTitle: configData.navbarTitle,
          navbarLogoSrc: configData.logoSrc,
          feature1Title: configData.feature1Title || null,
          feature1Text: configData.feature1Text || null,
          feature1Image: configData.feature1Image || null,
          feature2Title: configData.feature2Title || null,
          feature2Text: configData.feature2Text || null,
          feature2Image: configData.feature2Image || null,
          feature3Title: configData.feature3Title || null,
          feature3Text: configData.feature3Text || null,
          feature3Image: configData.feature3Image || null,
          buttonText: configData.buttonText,
          buttonLink: configData.buttonLink
        }
      })
    }

    return this.getDocsConfig()
  }
}
