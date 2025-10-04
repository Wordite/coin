import React from 'react'

const Pagination = ({ page, totalPages, setPage }: { page: number, totalPages: number, setPage: (page: number) => void }) => {
  return (
    <div className='flex items-center justify-between px-[1rem] py-[.875rem]'>
      <div className='text-white-transparent-75 text-[.875rem]'>
        Page {page} of {totalPages}
      </div>
      <div className='flex items-center gap-[.5rem]'>
        <button
          className='px-[.75rem] h-[2rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm disabled:opacity-50'
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
          .map((p) => (
            <button
              key={p}
              className={`w-[2rem] h-[2rem] rounded-sm border-1 border-stroke-dark ${
                p === page ? 'bg-purple-500 text-white' : 'bg-gray-transparent-70'
              } transition-200`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        <button
          className='px-[.75rem] h-[2rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm disabled:opacity-50'
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export { Pagination }
