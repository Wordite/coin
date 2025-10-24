import Button from '@/shared/Button'
import ClockIcon from '@/assets/icons/clock.svg'
import ServerIcon from '@/assets/icons/server.svg'
import { Pagination } from './ui/Pagination'
import { Emty } from './ui/Emty'
import { MobileCard } from './ui/MobileCard'
import { TransactionDetailsModal } from '@/widgets/TransactionDetailsModal'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useDetailsModal } from './model/useDetailsModal'
import { useWalletStore } from '@/app/store/walletStore'
import { useTransactionsTable } from '@/hooks/useTransactionsTable'

const TransactionsTable = () => {
  const isMobile = useIsMobile()
  const { handleDetailsClick, handleCloseModal, isModalOpen, selectedTransaction } = useDetailsModal()
  const { data } = useWalletStore()
  
  const { page, setPage, totalPages, currentItems } = useTransactionsTable({ 
    orders: data.transactions, 
    pageSize: 10 
  })

  if (data.transactions.length === 0) return <Emty />

  if (isMobile) {
    return (
      <>
        <div className='mt-[2rem]'>
          <div className='space-y-4'>
            {currentItems.map((transaction, i) => (
              <MobileCard key={i} transaction={transaction} onDetailsClick={handleDetailsClick} />
            ))}
          </div>
          <div className='mt-6'>
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        </div>
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      </>
    )
  }

  return (
    <>
      <div className='mt-[2rem] rounded-xxl overflow-hidden bg-gray-transparent-10 border-1 border-stroke-light'>
        <div className='grid grid-cols-6 text-[.875rem] text-white-transparent-75 px-[1rem] py-[.875rem] border-b-1 border-stroke-light bg-gray-transparent-70'>
          <span>Time</span>
          <span>Paid</span>
          <span>Receive</span>
          <span>Price</span>
          <span>Stage</span>
          <span className='text-right pr-[.5rem]'>Action</span>
        </div>
        {currentItems.map((o, i) => (
          <div
            key={i}
            className={`grid grid-cols-6 items-center px-[1rem] py-[.875rem] border-b-1 border-stroke-dark last:border-b-0 ${
              i % 2 === 1 ? 'bg-gray-transparent-10' : ''
            } hover:bg-gray-transparent-70 transition-200`}
          >
            <span>{new Date(o.timestamp).toLocaleDateString()}</span>
            <span>{o.amount} {o.type}</span>
            <div className='flex items-center gap-[.5rem] relative group'>
              <span>{o.coinsPurchased}</span>
              <div className='flex items-center gap-1'>
                {o.txHash === 'ADMIN_ADJUSTMENT' && (
                  <div className='relative group'>
                    <div className='w-6 h-6 rounded border-1 border-stroke-dark bg-gray-transparent-70 flex items-center justify-center'>
                      <ServerIcon className='w-[1rem] h-[1rem] [&>path]:fill-white' />
                    </div>
                    {/* Tooltip - сверху, центрирован */}
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-dark-200 border border-stroke-dark rounded-lg text-white text-[.75rem] whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none z-10'>
                      Issued by admin
                      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-stroke-dark'></div>
                    </div>
                  </div>
                )}
                {!o.isReceived && (
                  <div className='relative group'>
                    <div className='w-6 h-6 rounded border-1 border-stroke-dark bg-gray-transparent-70 flex items-center justify-center'>
                      <ClockIcon className='w-[1rem] h-[1rem]' />
                    </div>
                    {/* Tooltip - снизу, центрирован */}
                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-200 border border-stroke-dark rounded-lg text-white text-[.75rem] whitespace-nowrap opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none z-10'>
                      Will be received after presale end
                      <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stroke-dark'></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span>{o.rate}</span>
            <span>{o.isSuccessful ? 'Completed' : 'Failed'}</span>
            <div className='flex justify-end gap-[.5rem]'>
              <Button
                onClick={() => handleDetailsClick(o)}
                color='dark'
                className='clickable h-[2rem] px-[.75rem] text-[.875rem]'
              >
                Details
              </Button>
            </div>
          </div>
        ))}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </>
  )
}

export { TransactionsTable }
