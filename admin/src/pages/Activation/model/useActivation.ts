import { useQuery } from '@tanstack/react-query'
import { api } from '@/app/api'

const useActivation = (link: string) => {
  return useQuery({
    queryKey: ['activation', link],
    queryFn: () => api.get(`/activate/${link}`),
    enabled: !!link,
    retry: false,
  })
}

export { useActivation } 