import { useModalStore } from '@/app/store/modalStore'
import { Modals } from '@/constants/modals'
import { Modal, useModal } from '@/shared/Modal'
import Button from '@/shared/Button'

const SuccessPurchaseModal = () => {
  const { isOpen } = useModal(Modals.SUCCESS_PURCHASE)
  const { closeModal } = useModalStore()

  return (
    <Modal
      isOpen={isOpen}
      title='Success purchase!'
      onClose={() => closeModal(Modals.SUCCESS_PURCHASE)}
    >
      <div className='text-[1.1rem] max-md:text-[1.4rem] text-white-transparent-75'>
        <p>
          Your purchase has been successful! You can now view your purchase history and other details in your profile.
        </p>
      </div>

      <div className='flex flex-col  mt-[2.4rem]  gap-[1rem]'>
        <Button
          className='w-full h-[3.43rem] max-md:h-[4.62rem] max-md:text-[1.6rem]'
          color='purple'
          onClick={() => closeModal(Modals.SUCCESS_PURCHASE)}
        >
          Ok
        </Button>

        <Button
          className='w-full h-[3.43rem] max-md:h-[4.62rem]'
          color='dark'
          isLink
          to={'/profile'}
          onClick={() => closeModal(Modals.SUCCESS_PURCHASE)}
        >
          Go to Profile
        </Button>
      </div>
    </Modal>
  )
}

export { SuccessPurchaseModal }
