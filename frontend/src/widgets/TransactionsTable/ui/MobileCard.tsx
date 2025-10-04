import Button from '@/shared/Button'
import ClockIcon from '@/assets/icons/clock.svg'
import type { Transaction } from '@/app/types/transaction.type'

interface MobileCardProps {
  transaction: Transaction
  onDetailsClick: (transaction: Transaction) => void
}

const MobileCard = ({ transaction, onDetailsClick }: MobileCardProps) => {
  return (
    <div className='bg-gradient-to-br from-gray-transparent-20 to-gray-transparent-10 border-1 border-stroke-light rounded-xxl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-stroke-light/50'>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-white text-base font-semibold'>{new Date(transaction.timestamp).toLocaleDateString()}</div>
        <div className='text-white text-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm'>
          {transaction.isSuccessful ? 'Completed' : 'Failed'}
        </div>
      </div>

      <div className='space-y-3 mb-5'>
        <div className='flex justify-between items-center py-2 px-3 bg-gray-transparent-20 rounded-lg'>
          <span className='text-white-transparent-75 text-[1.35rem] font-medium'>Paid</span>
          <span className='text-white text-base font-semibold text-[1.2rem]'>
            {transaction.amount} {transaction.type}
          </span>
        </div>

        <div className='flex justify-between items-center py-2 px-3 bg-gray-transparent-20 rounded-lg'>
          <span className='text-white-transparent-75 text-[1.35rem] font-medium'>Receive</span>
          <div className='flex items-center gap-2'>
            <span className='text-white text-base text-[1.2rem] leading-[1em] font-semibold'>
              {transaction.coinsPurchased}
            </span>
            {!transaction.isReceived && (
              <div className='relative group -translate-y-[0.125rem]'>
                <div className='w-[1.5rem] h-[1.5rem] rounded border-1 border-stroke-dark bg-gray-transparent-70 flex items-center justify-center'>
                  <ClockIcon className='w-[1rem] h-[1rem]' />
                </div>
                {/* Tooltip */}
                <div className='absolute bottom-full right-0 mb-2 px-3 py-2 bg-dark-200 border border-stroke-dark rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none z-10'>
                  Will be received after presale end
                  <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stroke-dark'></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-between items-center py-2 px-3 bg-gray-transparent-20 rounded-lg'>
          <span className='text-white-transparent-75 text-[1.35rem] font-medium'>Rate</span>
          <span className='text-white text-base  text-[1.2rem] font-semibold'>
            {transaction.rate}
          </span>
        </div>
      </div>

      <div className='flex justify-end'>
        <Button 
          color='dark' 
          className='clickable w-full h-[3.6rem] text-[0.2rem] font-medium'
          onClick={() => onDetailsClick(transaction)}
        >
          Details
        </Button>
      </div>
    </div>
  )
}

export { MobileCard }
