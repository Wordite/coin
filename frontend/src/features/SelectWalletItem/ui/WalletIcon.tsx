import PhantomIcon from '@/assets/icons/phantom.svg'
import SolflareIcon from '@/assets/icons/solflare.svg'
import { Wallets } from '@/services/wallets.service'

const WalletIcon = ({ name }: { name: keyof typeof Wallets.adapters }) => {
  if (name === 'phantom') return <PhantomIcon className='w-[1.813rem] h-[1.5rem]' />
  if (name === 'solflare') return <SolflareIcon className='w-[1.75rem] h-[1.75rem]' />

  return null
}

export { WalletIcon }
