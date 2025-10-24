import { useState } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Wallets } from '@/services/wallets.service'
import { useToastContext } from '@/shared/Toast'
import { useConfettiStore } from '@/app/store/confettiStore'
import type { Provider } from '@reown/appkit-adapter-solana/react'
import { Modals } from '@/constants/modals'
import { useModalStore } from '@/app/store/modalStore'

interface PurchaseCoinsParams {
  toPublicKey: string
  amount: number
  currency: 'SOL' | 'USDT'
}

interface UsePurchaseCoinsReturn {
  purchaseCoins: (params: PurchaseCoinsParams) => Promise<string | null>
  isPurchasing: boolean
  error: string | null
}

export const usePurchaseCoins = (): UsePurchaseCoinsReturn => {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const { showError } = useToastContext()
  const { triggerConfetti } = useConfettiStore()
  const { openModal } = useModalStore()

  const purchaseCoins = async ({ toPublicKey, amount, currency }: PurchaseCoinsParams): Promise<string | null> => {
    if (!isConnected || !address) {
      const errorMsg = 'Wallet not connected'
      setError(errorMsg)
      showError(errorMsg)
      return null
    }

    if (!toPublicKey) {
      const errorMsg = 'Root wallet public key not provided'
      setError(errorMsg)
      showError(errorMsg)
      return null
    }

    if (amount <= 0) {
      const errorMsg = 'Invalid amount'
      setError(errorMsg)
      showError(errorMsg)
      return null
    }

    setIsPurchasing(true)
    setError(null)

    try {
      if (!walletProvider) {
        throw new Error('Wallet provider not available. Please ensure wallet is connected.')
      }

      if (!connection) {
        throw new Error('Connection not available. Please ensure wallet is connected.')
      }

      const signature = await Wallets.sendForPurchase(
        toPublicKey,
        amount,
        currency,
        walletProvider,
        address,
        connection
      )


      // success
      triggerConfetti()
      openModal(Modals.SUCCESS_PURCHASE)
      
      return signature

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send payment'
      setError(errorMsg)
      showError(errorMsg)
      console.error('Purchase error:', err)
      return null
    } finally {
      setIsPurchasing(false)
    }
  }

  return {
    purchaseCoins,
    isPurchasing,
    error
  }
}
