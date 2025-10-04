const WhatIsBenefitsSkeleton = () => {
  return (
    <div className='flex flex-col gap-[1.125rem] max-md:gap-[4.5rem] max-md:mt-[2.5rem]'>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className='w-[28.75rem] flex gap-[1.125rem] max-md:w-[95%] max-md:mx-auto max-md:gap-[1.5rem]'>
          {/* Icon skeleton */}
          <div className='flex flex-col items-center'>
            <div className='w-[3.938rem] h-[3.938rem] bg-gray-300 rounded-full animate-pulse max-md:w-[5.5rem] max-md:h-[5.5rem]' />

            {/* Vertical line skeleton (except for last item) */}
            {index < 4 && (
              <div className='mt-[.5rem]'>
                <div className='w-[.125rem] h-[1.625rem] bg-gray-300 animate-pulse max-md:h-[calc(100%+4.5rem)]' />
              </div>
            )}
          </div>

          {/* Content skeleton */}
          <div className='flex-1'>
            <div className='h-[1.688rem] w-[12rem] bg-gray-300 rounded animate-pulse max-md:h-[2.5rem] max-md:w-[16rem]' />
            <div className='mt-[.313rem] max-md:mt-[.4rem]'>
              <div className='h-[.875rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[1.25rem] max-md:w-[24rem] mb-2' />
              <div className='h-[.875rem] w-[18rem] bg-gray-300 rounded animate-pulse max-md:h-[1.25rem] max-md:w-[22rem]' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { WhatIsBenefitsSkeleton }