import CrossIcon from '@/assets/icons/cross.svg'
import Button from '@/shared/Button'
import { useEffect, useState } from 'react'
import styles from './TransactionDetailsModal.module.scss'

interface TransactionItem {
  time: string
  amount: string
  receive: string
  price: string
  stage: string
  isPresale?: boolean
  isClaimed?: boolean
  txHash?: string
  blockTime?: string
  status?: 'completed' | 'pending' | 'failed'
}

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: TransactionItem | null
}

const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.classList.add('modal-open')

      setTimeout(() => {
        document.body.querySelector('.' + styles.modalOverlay)?.classList.add(styles.open)
        document.body.querySelector('.' + styles.modalContent)?.classList.add(styles.open)
      }, 10)
    } else {
      document.body.querySelector('.' + styles.modalOverlay)?.classList.remove(styles.open)
      document.body.querySelector('.' + styles.modalContent)?.classList.remove(styles.open)

      setTimeout(() => {
        setIsVisible(false)
        document.body.classList.remove('modal-open')
      }, 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  if (!isVisible) return null
  if (!transaction) return null

  return (
    <>
      <div
        className={`${styles.modalOverlay} fixed left-0 top-0 w-full h-full bg-black/50 z-[29000] backdrop-blur-md`}
        onClick={onClose}
      />
      <div
        className={`${styles.modalContent} w-[32rem] bg-gray-transparent-70 border-1 border-stroke-light rounded-xxl p-6 shadow-2xl z-[30000] max-md:w-[90%] max-md:p-[1.5rem] max-md:text-[1.125rem]`}
      >
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-white text-xl font-semibold max-md:text-[1.8rem]'>Transaction Details</h2>
          <button
            onClick={onClose}
            className='cursor-pointer w-[1.25rem] h-[1.25rem] max-md:w-[1.8rem] max-md:h-[1.8rem] hover:scale-110 transition-all duration-300 [&>path]:fill-white'
          >
            <CrossIcon className='w-full h-full' />
          </button>
        </div>

        <div className='bg-gray-transparent-70 border border-stroke-dark rounded-lg p-4'>
          <div className='flex justify-between items-center mb-3'>
            <div className='text-white text-sm font-medium max-md:text-[1.2rem]'>Transaction Details</div>
            <div className='text-white-transparent-75 text-xs max-md:text-[0.8rem]'>{transaction.time}</div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-white-transparent-75 text-sm max-md:text-[1.2rem]'>Amount:</span>
              <span className='text-white text-sm font-medium max-md:text-[1rem]'>{transaction.amount}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-white-transparent-75 text-sm max-md:text-[1.2rem]'>Rate:</span>
              <span className='text-white text-sm font-medium max-md:text-[1rem]'>{transaction.price}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-white-transparent-75 text-sm max-md:text-[1.2rem]'>Coins:</span>
              <span className='text-white text-sm font-medium max-md:text-[1rem]'>{transaction.receive}</span>
            </div>
          </div>
        </div>

        <div className='flex justify-end mt-6'>
          <Button
            color='green'
            className='clickable h-10 px-6 text-[1rem] max-md:mt-[4rem] max-md:w-full max-md:h-[4rem]'
            isLink
            target='_blank'
            to={`https://solscan.io/tx/${transaction.txHash}`}
          >
            View on Solscan
          </Button>
        </div>
      </div>
    </>
  )
}

export { TransactionDetailsModal }
