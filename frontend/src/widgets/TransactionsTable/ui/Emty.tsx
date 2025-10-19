
const Emty = () => {
  return (
    <>
      {/* Desktop version */}
      <div className='mt-[2rem] rounded-xxl overflow-hidden bg-gray-transparent-10 border-1 border-stroke-light max-md:hidden'>
        <div className='grid grid-cols-6 text-[.875rem] text-white-transparent-75 px-[1rem] py-[.875rem] border-b-1 border-stroke-light bg-gray-transparent-70'>
          <span>Time</span>
          <span>Paid</span>
          <span>Receive</span>
          <span>Price</span>
          <span>Stage</span>
          <span className='text-right pr-[.5rem]'>Action</span>
        </div>
        <div className='flex items-center justify-center py-[4rem]'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-transparent-20 border-2 border-stroke-light flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-white-transparent-50'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <p className='text-white-transparent-75 text-[1rem] font-medium'>
              Have not transactions yet
            </p>
            <p className='text-white-transparent-50 text-[.875rem] mt-2'>
              Your transaction history will appear here
            </p>
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className='mt-[2rem] max-md:block hidden'>
        <div className='flex items-center justify-center py-[4rem]'>
          <div className='text-center'>
            <div className='w-[6rem] h-[6rem] mx-auto mb-4 rounded-full bg-gray-transparent-20 border-2 border-stroke-light flex items-center justify-center'>
              <svg
                className='w-[3rem] h-[3rem] text-white-transparent-50'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <p className='text-white-transparent-75 text-[1.56rem] mt-[1.5rem] font-medium'>
              Have not transactions yet
            </p>
            <p className='text-white-transparent-50 text-[1.3rem] mt-[0.7rem]'>
              Your transaction history will appear here
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export { Emty }
