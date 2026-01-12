import { useEffect, useRef } from 'react'
import { useAppKitAccount, useAppKitState, useAppKitEvents } from '@reown/appkit/react'
import { useWalletStore } from '@/app/store/walletStore'
import { Wallets } from '@/services/wallets.service'
import { useToastContext } from '@/shared/Toast'
import { Modals } from '@/constants/modals'
import { useModalStore } from './store/modalStore'

export const WalletConnectionHandler = () => {
  const { isConnected, address } = useAppKitAccount()
  const { showSuccess, showError } = useToastContext()
  const { open } = useAppKitState()
  const appkitEvents = useAppKitEvents()
  const wasOpenRef = useRef(false)
  const lastQrAttemptRef = useRef(false)
  const { openModal } = useModalStore()

  useEffect(() => {
    const handleConnectionChange = async () => {
      // console.log('handleConnectionChange called: isConnected =', isConnected, 'address =', address)

      if (isConnected && address) {
        // console.log('Wallet connected:', address)
        showSuccess('Wallet connected successfully!')

        useWalletStore.setState({ isConnected: true })

        try {
          const balance = await Wallets.getBalance(address)
          useWalletStore.setState({ balance })
          // console.log('Balance loaded:', balance)
        } catch (error) {
          console.error('Failed to get balance:', error)
          showError('Failed to load wallet balance')
        }
      } else if (!isConnected) {
        // console.log('Wallet disconnected')
        useWalletStore.setState({
          isConnected: false,
          balance: { sol: 0, usdt: 0 },
        })
      }
    }

    handleConnectionChange()
  }, [isConnected, address, showSuccess, showError])

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    if (wasOpen && !open && (!isConnected || !address)) {
      if (lastQrAttemptRef.current) {
        openModal(Modals.FAILED_WALLET_CONNECT)
      }
  
      lastQrAttemptRef.current = false
    }
    wasOpenRef.current = open
  }, [open, isConnected, address, showError])

  // additional logging + heuristic for QR/WalletConnect attempts
  useEffect(() => {
    if (appkitEvents) {
      try {
        const raw: any = appkitEvents.data
        const props = raw?.properties ?? raw
        const text = JSON.stringify(props || {}).toLowerCase()
        if (
          text.includes('qr') ||
          text.includes('walletconnect') ||
          text.includes('wc_uri') ||
          text.includes('wc:') ||
          text.includes('deeplink') ||
          text.includes('universal')
        ) {
          lastQrAttemptRef.current = true
        }
        if (isConnected && address) {
          lastQrAttemptRef.current = false
        }
      } catch (_) {
        // ignore
      }
    }
  }, [appkitEvents?.timestamp, isConnected, address])

  return null
}
