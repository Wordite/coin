import { useWalletStore } from '@/app/store/walletStore'
import { useAccount } from '@/hooks/useAccount'
import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect } from 'react'

const useServerAccount = () => {
  const { address } = useAppKitAccount()
  const { connectWallet, data } = useAccount()
  const { isConnected, setData } = useWalletStore()

  const refetchAccount = () => {
    if (isConnected && address) {
      connectWallet({ address: address })
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      connectWallet({ address: address })
    }
  }, [isConnected, address])

  useEffect(() => {
    if (data) {
      setData(data)
    }
  }, [data])

  return { refetchAccount }
}

export { useServerAccount }
