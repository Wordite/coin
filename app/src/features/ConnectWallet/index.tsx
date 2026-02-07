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
        className="flex items-center gap-[.5rem] px-[1rem] py-[.6rem] max-md:px-[1rem] max-md:py-[.7rem] rounded-lg bg-gray-transparent-10 backdrop-blur-sm border-1 border-stroke-light hover:bg-black/70 transition-all duration-200 cursor-pointer"
      >
        <div className="flex flex-col items-start">
          <span className="text-white text-[.875rem] max-md:text-[1.2rem] font-medium">
            {formatAddress(address)}
          </span>
          <span className="text-white-transparent-50 text-[.75rem] max-md:text-[1rem]">Connected</span>
        </div>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="text-white-transparent-50 w-[1rem] h-[1rem] max-md:w-[1.3rem] max-md:h-[1.3rem]"
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
      loadingText="..."
      className="!px-[1.5rem] !py-[.7rem] max-md:!px-[1.5rem] max-md:!py-[.9rem] max-md:w-full"
    >
      Connect wallet
    </Button>
  )
}

export default ConnectWallet
