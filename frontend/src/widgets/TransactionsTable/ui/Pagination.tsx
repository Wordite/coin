

const Pagination = ({ page, totalPages, setPage }: { page: number, totalPages: number, setPage: (page: number) => void }) => {
  return (
    <div className='flex items-center justify-between px-[1rem] py-[.875rem] max-md:px-[1.4375rem] max-md:py-[1.2578125rem]'>
      <div className='text-white-transparent-75 text-[.875rem] max-md:text-[1.2578125rem]'>
        Page {page} of {totalPages}
      </div>
      <div className='flex items-center gap-[.5rem] max-md:gap-[.71875rem]'>
        <button
          className='clickable px-[.75rem] h-[2rem] max-md:px-[1.078125rem] max-md:h-[2.875rem] max-md:text-[1.2578125rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm disabled:opacity-50 cursor-pointer hover:bg-gray-transparent-50 hover:border-stroke-light transition-all duration-200 disabled:cursor-not-allowed disabled:hover:bg-gray-transparent-70 disabled:hover:border-stroke-dark'
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
          .map((p) => (
            <button
              key={p}
              className={`clickable w-[2rem] h-[2rem] max-md:w-[2.875rem] max-md:h-[2.875rem] max-md:text-[1.2578125rem] rounded-sm border-1 border-stroke-dark cursor-pointer transition-all duration-200 hover:scale-105 ${
                p === page 
                  ? 'bg-purple-500 text-white border-purple-400 shadow-lg' 
                  : 'bg-gray-transparent-70 hover:bg-gray-transparent-50 hover:border-stroke-light'
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        <button
          className='clickable px-[.75rem] h-[2rem] max-md:px-[1.078125rem] max-md:h-[2.875rem] max-md:text-[1.2578125rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm disabled:opacity-50 cursor-pointer hover:bg-gray-transparent-50 hover:border-stroke-light transition-all duration-200 disabled:cursor-not-allowed disabled:hover:bg-gray-transparent-70 disabled:hover:border-stroke-dark'
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export { Pagination }
