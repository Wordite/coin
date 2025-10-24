import { api } from '@/app/api'
import { useQuery } from '@tanstack/react-query'

interface PresaleSettings {
  stage: string
  sold: number
  total: number
  name: string
  decimals: number
  minBuyAmount: number
  maxBuyAmount: number
}


const usePresaleSettings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['presale-settings'],
    queryFn: () => api.get<PresaleSettings>('/coin/public/presale-settings'),
    select: (data) => data.data as PresaleSettings,
  })

  return {
    presaleSettings: data,
    isLoading,
    error,
    refetchPresaleSettings: refetch,
  }
}

export { usePresaleSettings }
