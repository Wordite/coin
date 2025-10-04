import { Wallets } from '@/services/wallets.service'
import { WalletIcon } from './ui/WalletIcon'
import { WalletStatus } from './ui/WalletStatus'
import { useHandleClick } from './model/useHandleClick'
import { useWalletModalStore } from '@/app/store/walletModalStore'

interface SelectWalletItemProps {
  wallet: keyof typeof Wallets.adapters
}

const SelectWalletItem = ({ wallet }: SelectWalletItemProps) => {
  const walletName = Wallets.getWalletNameByAdapterKey(wallet)
  const isInstalled = Wallets.checkIsAviliableWallet(walletName)
  const { setIsLoading } = useWalletModalStore()

  const { handleClick } = useHandleClick()

  return (
    <figure
      onClick={() => {
        setIsLoading(true)
        handleClick(walletName, isInstalled)
      }}
      className='clickable h-[3.25rem] max-md:h-[6rem] font-medium p-[.313rem] max-md:p-[0.5rem] hover:bg-gray-transparent-50 border-stroke-light duration-150 cursor-pointer rounded-md flex items-center border-1 hover:border-stroke-dark'
    >
      <div className='w-[2.813rem] h-[2.5rem] max-md:w-[5rem] max-md:h-[5rem] overflow-hidden bg-gray-transparent-50 rounded-md flex items-center justify-center border-1 border-stroke-light'>
        {/* <WalletIcon name={wallet} /> */}
        <img src={Wallets.adapters[wallet].icon} alt={walletName} className='w-[2rem] h-[2rem] max-md:w-[4rem] max-md:h-[4rem]' />
      </div>
      <p className='font-medium ml-[.625rem] max-md:text-[1.5rem]'>{walletName}</p>

      <WalletStatus isInstalled={isInstalled} />
    </figure>
  )
}

export { SelectWalletItem }
