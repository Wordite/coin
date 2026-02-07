import { useQuery } from '@tanstack/react-query'
import { api } from '@/app/api'

export interface MapSettings {
  id: string
  title: string
}

const useMapSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['map', 'settings'],
    queryFn: () => api.get('/map/settings'),
    select: (data) => data.data as MapSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    mapSettings: data,
    isLoading,
    error,
  }
}

export { useMapSettings }
