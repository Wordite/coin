import type { WalletName } from '@solana/wallet-adapter-base'
import { Wallets } from '@/services/wallets.service'
// import { linksInstall } from '../contstants/linksInstall'
import { useWalletModalStore } from '@/app/store/walletModalStore'

const useHandleClick = () => {
  const { setIsLoading } = useWalletModalStore()

  const handleClick = (walletName: WalletName, isInstalled: boolean) => {
    const adapterKey = Wallets.getAdapterKeyByWalletName(walletName)
    Wallets.selectWallet(walletName)
    alert(Wallets.adapters[adapterKey].url)
    if (isInstalled) {
      console.log('selectWallet', walletName)
      // Wallets.selectWallet(walletName)
    } else {
      const adapterKey = Wallets.getAdapterKeyByWalletName(walletName)
      if (adapterKey) {
        Wallets.adapters[adapterKey].url
        // window.open(Wallets.adapters[adapterKey].url, '_blank')
        // window.open(linksInstall[adapterKey as keyof typeof linksInstall], '_blank')        

        setIsLoading(false)
      }
    }
  }

  return { handleClick }
}

export { useHandleClick }
