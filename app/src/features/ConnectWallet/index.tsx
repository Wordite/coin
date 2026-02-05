import { useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import Button from '../../shared/Button'

const ConnectWallet = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [isConnecting, setIsConnecting] = useState(false)

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await open({ view: 'Connect' })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleOpenAccount = async () => {
    try {
      await open({ view: 'Account' })
    } catch (error) {
      console.error('Failed to open account:', error)
    }
  }

  if (isConnected && address) {
    return (
      <button
        onClick={handleOpenAccount}
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-purple-500/30 hover:bg-black/70 transition-all duration-200 cursor-pointer"
      >
        <div className="flex flex-col items-start">
          <span className="text-white text-sm font-medium">
            {formatAddress(address)}
          </span>
          <span className="text-purple-300 text-xs">Connected</span>
        </div>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="text-purple-300 w-4 h-4"
        >
          <path
            d="M4.5 3L7.5 6L4.5 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    )
  }

  return (
    <Button
      color="purple"
      onClick={handleConnect}
      isLoading={isConnecting}
      loadingText="Connecting..."
      className="px-5 py-2.5 text-sm"
    >
      Connect
    </Button>
  )
}

export default ConnectWallet
