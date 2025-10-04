import { type ContactFormData } from '@/app/validation'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/app/api'

const useSendContactForm = () => {
  const {
    mutate: sendContactForm,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationKey: ['send-contact-form'],
    mutationFn: (data: ContactFormData) => api.post('/contact', data),
  })

  return { isPending, isSuccess, isError, sendContactForm }
}

export { useSendContactForm }
