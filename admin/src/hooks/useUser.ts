import { api } from '@/app/api'
import { useQuery } from '@tanstack/react-query'
import type { AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh'
import { useAuthStore } from '@/app/store/authStore'
import { AxiosError } from 'axios'
import { Navigate } from '@/services/navigate'
import { useEffect } from 'react'

const useUser = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/user/me', { skipAuthRefresh: true } as AxiosAuthRefreshRequestConfig),
    retry: false,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (error instanceof AxiosError && error.response?.status === 403) {
      setIsAuthenticated(false)
      Navigate.to('login')
    }
  }, [error])

  return { data: data?.data, isLoading, isError }
}

export { useUser }
