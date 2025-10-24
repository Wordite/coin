import { useMutation } from "@tanstack/react-query"
import { api } from "@/app/api"
import { useToast } from "@/shared/Toast"
import { useEffect } from "react"
import type { Transaction } from "@/app/types/transaction.type"

interface ConnectWalletParams {
  address: string
}

interface ConnectWalletResponse {
  data: {
    data: {
      transactions: Transaction[]
      totalCoinsPurchased: number
      totalCoinsReceived: number
      totalSpentSOL: number
      totalSpentUSDT: number
    }
  }
}

const useAccount = () => {
  const { mutate: connectWallet, isPending, isError, error, data } = useMutation({
    mutationKey: ['connect-wallet'],
    mutationFn: (data: ConnectWalletParams): Promise<ConnectWalletResponse> => api.post('/auth/wallet', data),
  })

  const { showError } = useToast()

  useEffect(() => {
    if (isError) {
      showError('An error occurred during getting wallet information')
    }
  }, [isError, error])

  return { connectWallet, isPending, isError, data: data?.data.data }
}

export { useAccount }