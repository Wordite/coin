import { useEffect, useRef } from 'react'
import { useAppKitAccount, useAppKitState, useAppKitEvents } from '@reown/appkit/react'
import { useWalletStore } from '@/app/store/walletStore'
import { Wallets } from '@/services/wallets.service'
import { useToast } from '@/shared/Toast'

export const WalletConnectionHandler = () => {
  const { isConnected, address } = useAppKitAccount()
  const { showSuccess, showError } = useToast()
  const { open } = useAppKitState()
  const appkitEvents = useAppKitEvents()
  const wasOpenRef = useRef(false)

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
          balance: { sol: 0, usdt: 0 },
        })
      }
    }

    handleConnectionChange()
  }, [isConnected, address, showSuccess, showError])

  // Show notification if modal was closed without establishing connection
  useEffect(() => {
    const wasOpen = wasOpenRef.current
    if (wasOpen && !open && (!isConnected || !address)) {
      showError('Wallet not connected. On mobile, use a Solana wallet (Phantom/Solflare/Backpack).')
    }
    wasOpenRef.current = open
  }, [open, isConnected, address, showError])

  // additional logging
  useEffect(() => {
    if (appkitEvents) {
      console.log('AppKit event:', appkitEvents.data)
    }
  }, [appkitEvents?.timestamp])

  return null
}
