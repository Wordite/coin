import { useQuery } from '@tanstack/react-query'
import { api } from '@/app/api'

export interface Settings {
  // Site Settings
  siteName: string
  siteLogo: string
  siteDescription: string

  presaleEndTime: number // seconds until presale ends
  presaleActive: boolean

  // Exchange Rates
  usdtToCoinRate: number
  solToCoinRate: number
}

const useSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => api.get('/settings/public'),
    select: (data) => data.data as Settings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    settings: data,
    isLoading,
    error,
  }
}

export { useSettings }
