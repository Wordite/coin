import { api } from '../app/api'

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
}

class SettingsApiService {
  async getSettings(): Promise<SettingsData> {
    const response = await api.get('/settings')
    return response.data
  }

  async updateSettings(settings: SettingsData): Promise<SettingsData> {
    const response = await api.put('/settings', settings)
    return response.data
  }
}

export const settingsApi = new SettingsApiService()