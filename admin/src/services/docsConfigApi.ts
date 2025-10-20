import { api } from '../app/api'

export interface NavbarLink {
  type: string
  label: string
  href?: string
  sidebarId?: string
  position: string
}

export interface FooterLink {
  title: string
  items: Array<{
    label: string
    to?: string
    href?: string
  }>
}

export interface Feature {
  title: string
  description: string
  image: string
}

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

class DocsConfigApiService {
  async getConfig(): Promise<DocsConfigData> {
    const response = await api.get('/docs/config')
    return response.data
  }

  async updateConfig(config: DocsConfigData): Promise<DocsConfigData> {
    const response = await api.put('/docs/config', config)
    return response.data
  }

  async rebuildDocs(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/docs/content/rebuild')
    return response.data
  }
}

export const docsConfigApi = new DocsConfigApiService()