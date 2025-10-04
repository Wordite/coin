import { api } from '@/app/api'
import { useQuery } from '@tanstack/react-query'
import type { AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh'
import { useAuthStore } from '@/app/store/authStore'

const useUser = () => {
  const { isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/user/me', { skipAuthRefresh: true } as AxiosAuthRefreshRequestConfig),
    retry: false,
    enabled: isAuthenticated,
  })

  return { data: data?.data, isLoading, isError }
}

export { useUser }
