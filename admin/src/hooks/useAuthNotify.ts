import { useAuthStore } from '@/app/store/authStore'
import { Notify } from '@/services/notify'

/**
 * Hook for showing notifications only when user is authenticated
 * Prevents showing error notifications after redirect to login page
 */
export const useAuthNotify = () => {
  const { isAuthenticated } = useAuthStore()

  const error = (message: string, title?: string) => {
    if (isAuthenticated) {
      Notify.error(message, title)
    }
  }

  const success = (message: string, title?: string) => {
    if (isAuthenticated) {
      Notify.success(message, title)
    }
  }

  const warn = (message: string, title?: string) => {
    if (isAuthenticated) {
      Notify.warn(message, title)
    }
  }

  const info = (message: string, title?: string) => {
    if (isAuthenticated) {
      Notify.info(message, title)
    }
  }

  return {
    error,
    success,
    warn,
    info
  }
}
