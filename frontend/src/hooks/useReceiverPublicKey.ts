import { useQuery } from '@tanstack/react-query'
import { api } from '@/app/api'

const useReceiverPublicKey = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['receiver-public-key'],
    queryFn: () => api.get('/wallet/public-key'),
    select: (data) => data.data.publicKey,
  })

  return {
    receiverPublicKey: data,
    isLoading,
    error,
  }
}

export { useReceiverPublicKey }
