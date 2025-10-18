import { useEffect } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useWalletStore } from '@/app/store/walletStore'
import { Wallets } from '@/services/wallets.service'
import { useToast } from '@/shared/Toast'

export const WalletConnectionHandler = () => {
  const { isConnected, address } = useAppKitAccount()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    console.log('WalletConnectionHandler: isConnected =', isConnected, 'address =', address)
  }, [isConnected, address])

  useEffect(() => {
    const handleConnectionChange = async () => {
      console.log('handleConnectionChange called: isConnected =', isConnected, 'address =', address)

      if (isConnected && address) {
        console.log('Wallet connected:', address)
        showSuccess('Wallet connected successfully!')

        useWalletStore.setState({ isConnected: true })
    
        try {
          const balance = await Wallets.getBalance(address)
          useWalletStore.setState({ balance })
          console.log('Balance loaded:', balance)
        } catch (error) {
          console.error('Failed to get balance:', error)
          showError('Failed to load wallet balance')
        }
      } else if (!isConnected) {
        console.log('Wallet disconnected')
        useWalletStore.setState({
          isConnected: false,
          balance: { sol: 0, usdt: 0 }
        })
      }
    }

    handleConnectionChange()
  }, [isConnected, address, showSuccess, showError])




  // ============= DEBUG ======================
  const appkit = useAppKit()

  useEffect(() => {
    if (!appkit) return

    appkit.on('session_settled', (session) => {
      console.log('✅ WalletConnect session settled:', session)
    })
    appkit.on('session_update', (session) => {
      console.log('🔄 WalletConnect session updated:', session)
    })
    appkit.on('session_delete', () => {
      console.log('❌ WalletConnect session deleted')
    })
  }, [appkit])
  // =============================================

  return null
}

  return null
}
