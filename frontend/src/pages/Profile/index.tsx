import Button from '@/shared/Button'
import { useDisconnect, useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState } from 'react'
import { useWalletStore } from '@/app/store/walletStore'
import { TransactionsTable } from '@/widgets/TransactionsTable/TransactionsTable'
import { StatCard } from '@/entities/StatCard/StatCard'
import { StageTimer } from '@/widgets/StageTimer/StageTimer'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/shared/Toast'
import { usePresaleSettings } from '@/hooks/usePresaleSettings'



const Profile = () => {
  const { isConnected, data } = useWalletStore()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const { showError} = useToast()
  const { settings } = useSettings()
  const { presaleSettings } = usePresaleSettings()
  
  const { address } = useAppKitAccount()
  const publicKey = address || ''

  if (!isConnected)
    return (
      <section className='flex items-center justify-center min-h-screen'>
        <div className='text-center max-w-md max-md:max-w-[37rem] mx-auto px-4'>
          <div className='mb-8'>
            <div className='w-24 h-24 max-md:w-[7.9rem] max-md:h-[7.9rem] mx-auto mb-6 rounded-full bg-gray-transparent-20 border-2 border-stroke-light flex items-center justify-center'>
              <svg className='w-12 h-12 max-md:w-[4rem] max-md:h-[4rem] text-white-transparent-50' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h1 className='text-[2.5rem] max-md:text-[3.3rem] font-bold mb-4'>Your wallet is not connected :(</h1>
            <p className='text-white-transparent-75 text-[1.125rem] max-md:text-[1.5rem] leading-relaxed'>
              Connect your wallet to view your presale statistics, purchase history, and manage your tokens.
            </p>
          </div>
          <div className='space-y-3'>
            <Button 
              color='purple' 
              className='w-full h-[3.5rem] max-md:h-[4.6rem] text-[1.125rem] max-md:text-[1.5rem] font-semibold' 
              onClick={async () => {
                try {
                  setIsConnecting(true)
                  await open({ view: 'Connect' })
                } catch (error) {
                  showError('Failed to connect wallet')
                } finally {
                  setIsConnecting(false)
                }
              }}
              isLoading={isConnecting}
              loadingText='Connecting...'
            >
              Connect Wallet
            </Button>
            <Button 
              isLink
              to='/'
              color='dark' 
              className='w-full h-[3.5rem] max-md:h-[4.6rem] text-[1.125rem] max-md:text-[1.5rem] font-semibold' 
            >
              Go Home
            </Button>
          </div>
        </div>
      </section>
    )

  return (
    <section className='pt-[10rem] min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-[2rem] font-bold max-md:text-[3.75rem]'>Profile</h1>
          <div className='mt-[.5rem] text-white-transparent-75 text-[.875rem] max-md:text-[1.375rem] flex items-center gap-[.5rem]'>
            <span>Wallet: <span className='text-white'>{publicKey.slice(0, 6)}...{publicKey.slice(-4)}</span></span>
            <button
              className='h-[1.75rem] cursor-pointer px-[.6rem] text-[.75rem] max-md:h-[2.1875rem] max-md:px-[.75rem] max-md:text-[1.1rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm hover:brightness-120 transition-200'
              onClick={async () => {
                try { await navigator.clipboard.writeText(publicKey); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <Button onClick={() => disconnect()} color='dark' className='h-[3rem] max-md:h-[3.8rem] max-md:text-[1.35rem] mt-auto'>
          Disconnect
        </Button>
      </div>

      <div className='mt-[2rem] grid grid-cols-1 md:grid-cols-3 gap-[1rem]'>
        <StatCard title='Total Purchased' value={data.totalCoinsPurchased?.toString() + ' ' + presaleSettings?.name.toUpperCase()} />
        <StatCard title='Claimed' value={data.totalCoinsReceived?.toString() + ' ' + presaleSettings?.name.toUpperCase()} />
        <StatCard title='Total Spent' value={`${data.totalSpentSOL?.toString()} SOL, ${data.totalSpentUSDT?.toString()} USDT`} />
      </div>

      <StageTimer endDate={Date.now() + (settings?.presaleEndTime || 0) * 1000} />

      <TransactionsTable />
    </section>
  )
}

export { Profile }