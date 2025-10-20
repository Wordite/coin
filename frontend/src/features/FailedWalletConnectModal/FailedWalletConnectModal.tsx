import { Modal, useModal } from '@/shared/Modal'
import { Modals } from '@/constants/modals'
import Button from '@/shared/Button'
import { useModalStore } from '@/app/store/modalStore'

export const FailedWalletConnectModal = () => {
  const { isOpen } = useModal(Modals.FAILED_WALLET_CONNECT)
  const { closeModal } = useModalStore()
  const isDontShowAgain = localStorage.getItem('dontShowFailedWalletConnectModal') === 'true'

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowFailedWalletConnectModal', 'true')
    closeModal(Modals.FAILED_WALLET_CONNECT)
  }

  return (
    <Modal
      isOpen={isOpen && !isDontShowAgain}
      title='Failed to connect wallet'
      onClose={() => closeModal(Modals.FAILED_WALLET_CONNECT)}
    >
      <div className='text-[1.1rem] max-md:text-[1.4rem] text-white-transparent-75'>
        <p>
          If you tried to connect your wallet using a QR code, it’s likely that this wallet doesn’t
          support Solana connections (it may only work with Ethereum or other networks).
        </p>

        <p className='mt-[1rem]'>
          Please use Phantom, Solflare, Backpack, or another Solana-compatible wallet.
        </p>
      </div>

      <div className='flex flex-col  mt-[2.4rem]  gap-[1rem]'>
        <Button
          className='w-full h-[3.43rem] max-md:h-[4.62rem] max-md:text-[1.6rem]'
          color='purple'
          onClick={() => closeModal(Modals.FAILED_WALLET_CONNECT)}
        >
          Ok
        </Button>

        <Button
          className='w-full h-[3.43rem] max-md:h-[4.62rem]'
          color='dark'
          onClick={handleDontShowAgain}
        >
          Don't show again
        </Button>
      </div>
    </Modal>
  )
}
