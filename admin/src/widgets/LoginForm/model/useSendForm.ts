import { useMutation } from '@tanstack/react-query'
import { api } from '@/app/api'
import { type LoginFormData, type RegisterFormData } from '@/app/validation/authSchemas'
import { addToast } from '@heroui/toast'
import { useAuthStore } from '@/app/store/authStore'

const useSendForm = () => {
  const { setIsAuthFromSent } = useAuthStore()

  const signIn = useMutation({
    mutationKey: ['sign-in'],
    mutationFn: (data: LoginFormData) => api.post('/auth/sign-in', data),
    onSuccess: () => {
      setIsAuthFromSent(true)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred during sign in'
      const status = error.response?.status
      
      addToast({
        title: status === 401 ? 'Authentication Failed' : 'Error',
        description: message,
        color: status === 401 ? 'warning' : 'danger',
        variant: 'flat',
        timeout: 7000,
      })
    },
  })

  const signUp = useMutation({
    mutationKey: ['sign-up'],
    mutationFn: (data: RegisterFormData) => api.post('/auth/sign-up', data),
    onSuccess: () => {
      setIsAuthFromSent(true)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'An error occurred during sign up'
      const status = error.response?.status
      
      addToast({
        title: status === 409 ? 'Account Exists' : 'Error',
        description: message,
        color: status === 409 ? 'warning' : 'danger',
        variant: 'flat',
        timeout: 7000,
      })
    },
  })

  return { signIn, signUp }
}

export { useSendForm }
