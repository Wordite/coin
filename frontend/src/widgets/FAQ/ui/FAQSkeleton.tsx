const FAQSkeleton = () => {
  return (
    <section id='faq' className='mt-[6.25rem] relative transform-gpu will-change-contents max-md:mt-[12rem]'>
      {/* Section header skeleton */}
      <div className='flex flex-col items-center'>
        <div className='h-[3.438rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[4.3rem] max-md:w-[25rem]' />
        
        <div className='mt-[.938rem] mb-[1.438rem] max-md:mt-[1.175rem] max-md:mb-[1.8rem]'>
          <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
        </div>
        
        <div className='h-[1.25rem] w-[35rem] bg-gray-300 rounded animate-pulse max-md:w-[90%]' />
      </div>

      {/* FAQ items skeleton */}
      <div className='mt-[4.688rem]'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='w-[48.125rem] max-md:w-full mx-auto mt-[1.5rem] rounded-md bg-gray-transparent-10 border-1 border-stroke-light overflow-hidden'
          >
            {/* Question header skeleton */}
            <div className='h-[4.375rem] max-md:h-[7rem] p-[1.56rem] flex justify-between items-center'>
              <div className='flex-1'>
                <div className='h-[1.125rem] bg-gray-300 rounded animate-pulse w-3/4 mb-2 max-md:h-[1.6rem]' />
                <div className='h-[1.125rem] bg-gray-200 rounded animate-pulse w-1/2 max-md:h-[1.6rem]' />
              </div>
              
              {/* Arrow icon skeleton */}
              <div className='flex items-center gap-2'>
                <div className='w-[1.5rem] h-[0.5rem] bg-gray-300 rounded animate-pulse max-md:w-[2rem] max-md:h-[0.5rem]' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { FAQSkeleton }
