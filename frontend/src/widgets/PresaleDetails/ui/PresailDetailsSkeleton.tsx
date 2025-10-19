const PresailDetailsSkeleton = () => {
  return (
    <section id='presale-details' className='mt-[18.75rem] transform-gpu will-change-contents'>
      {/* SectionHead skeleton */}
      <div className='flex flex-col items-center'>
        <div className='h-[3.438rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[4.3rem] max-md:w-[25rem]' />
        
        <div className='mt-[.938rem] mb-[1.438rem] max-md:mt-[1.175rem] max-md:mb-[1.8rem]'>
          <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
        </div>
        
        <div className='h-[1.25rem] w-[35rem] bg-gray-300 rounded animate-pulse max-md:w-[90%]' />
      </div>

      {/* PresailDetailsInfo cards skeleton */}
      <div className='flex gap-[1rem] mt-[3.125rem] justify-center max-md:flex-col max-md:items-center max-md:gap-[2rem]'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='w-[16.875rem] h-[8.375rem] bg-gray-transparent-10 rounded-xxl p-[1.188rem] border-1 border-stroke-light max-md:w-[90%] max-md:h-[9.3rem]'>
            <div className='h-[1.125rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.5rem]' />
            <div className='mt-[1.25rem]'>
              <div className='h-[0.875rem] w-[12rem] bg-gray-300 rounded animate-pulse max-md:h-[1.1rem]' />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { PresailDetailsSkeleton }