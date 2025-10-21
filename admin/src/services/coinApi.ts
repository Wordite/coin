import { api } from '../app/api'

export interface CoinPresaleSettings {
  totalAmount: number
  stage: number
  soldAmount: number
  currentAmount: number
  status: 'PRESALE' | 'SOLD' | 'ACTIVE'
  name: string
  decimals: number
  minBuyAmount: number
  maxBuyAmount: number
  mintAddress?: string
  rpc?: string
  rpcEndpoints?: Array<{ url: string; priority: number; name: string }>
}

class CoinApiService {
  async getPresaleSettings(): Promise<CoinPresaleSettings> {
    const response = await api.get('/coin/presale-settings')
    return response.data
  }

  async updatePresaleSettings(settings: Partial<CoinPresaleSettings>): Promise<CoinPresaleSettings> {
    const response = await api.put('/coin/presale-settings', settings)
    return response.data
  }

  async getAvailableStages(): Promise<number[]> {
    const response = await api.get('/coin/available-stages')
    return response.data
  }

  async updateRpcEndpoints(endpoints: Array<{ url: string; priority: number; name: string }>): Promise<void> {
    await api.put('/coin/rpc-endpoints', { endpoints })
  }
}

export const coinApi = new CoinApiService()
