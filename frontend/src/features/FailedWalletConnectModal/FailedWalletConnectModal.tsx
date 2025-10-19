import { Modal, useModal } from '@/shared/Modal'
import { Modals } from '@/constants/modals'
import Button from '@/shared/Button'
import { useModalStore } from '@/app/store/modalStore'

export const FailedWalletConnectModal = () => {
  const { isOpen } = useModal(Modals.FAILED_WALLET_CONNECT)
  const { closeModal } = useModalStore()
  return (
    <Modal isOpen={isOpen} title='Failed to connect wallet' size='lg'>
      <div>
        QR connect via this wallet is not supported for Solana. Use Phantom/Solflare/Backpack or
        other Solana wallet.
      </div>

      <Button color='purple' onClick={() => closeModal(Modals.FAILED_WALLET_CONNECT)}>
        Ok
      </Button>
    </Modal>
  )
}
