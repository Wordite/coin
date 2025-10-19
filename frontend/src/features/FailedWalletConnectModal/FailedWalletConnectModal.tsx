import { Modal, useModal } from '@/shared/Modal'
import { Modals } from '@/constants/modals'
import Button from '@/shared/Button'
import { useModalStore } from '@/app/store/modalStore'

export const FailedWalletConnectModal = () => {
  const { isOpen } = useModal(Modals.FAILED_WALLET_CONNECT)
  const { closeModal } = useModalStore()
  return (
    <Modal
      isOpen={isOpen}
      title='Failed to connect wallet'
      onClose={() => closeModal(Modals.FAILED_WALLET_CONNECT)}
    >
      <div className='text-[1.1rem] text-white-transparent-75'>
        <p>
          If you tried to connect your wallet using a QR code, it’s likely that this wallet doesn’t
          support Solana connections (it may only work with Ethereum or other networks).
        </p>

        <p className='mt-[1rem]'>Please use Phantom, Solflare, Backpack, or another Solana-compatible wallet.</p>
      </div>

      <Button
        className='w-full h-[3.8rem] mt-[1.5rem]'
        color='purple'
        onClick={() => closeModal(Modals.FAILED_WALLET_CONNECT)}
      >
        Ok
      </Button>
    </Modal>
  )
}
