import { api } from '@/app/api'

export interface BrandingData {
  logoUrl: string
  title: string
  description: string
}

class BrandingApiService {
  async getLogo(): Promise<BrandingData> {
    const response = await api.get('/docs/branding/logo')
    return response.data
  }

  getImageUrl(url: string): string {
    const baseUrl = import.meta.env.VITE_BACKEND_URL
    const emptyUrl = baseUrl.replace('/api', '')
    return `${emptyUrl}${url}`
  }
}

export const brandingApi = new BrandingApiService()