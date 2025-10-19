const StagesPricingSkeleton = () => {
  return (
    <section id='stages-pricing' className='mt-[4.375rem] max-md:mt-[10rem] transform-gpu will-change-contents'>
      {/* SectionHead skeleton */}
      <div className='flex flex-col items-center'>
        <div className='h-[3.438rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[4.3rem] max-md:w-[25rem]' />
        
        <div className='mt-[.938rem] mb-[1.438rem] max-md:mt-[1.175rem] max-md:mb-[1.8rem]'>
          <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
        </div>
      </div>

      {/* StagesCards skeleton */}
      <div className='flex gap-[1.25rem] mt-[3.125rem] justify-center max-md:flex-col max-md:items-center max-md:gap-[2rem]'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='w-[16.875rem] h-[8.375rem] flex flex-col items-center bg-gray-transparent-10 rounded-xxl p-[1.1rem] border-1 border-stroke-light max-md:w-[60%] max-md:h-[10.5rem]'>
            {/* Stage title skeleton */}
            <div className='h-[1.125rem] w-[6rem] bg-gray-300 rounded animate-pulse max-md:h-[1.5rem]' />
            
            {/* TitleUnderline skeleton */}
            <div className='mt-[.5rem] max-md:mt-[0.65rem]'>
              <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse max-md:w-[10rem]' />
            </div>
            
            {/* Price skeleton */}
            <div className='h-[1.25rem] w-[8rem] bg-gray-300 rounded animate-pulse mt-[0.55rem] max-md:mt-[1.2rem] max-md:h-[1.5rem]' />
            
            {/* Tokens skeleton */}
            <div className='h-[0.875rem] w-[7rem] bg-gray-300 rounded animate-pulse mt-[.125rem] max-md:h-[1.1rem]' />
          </div>
        ))}
      </div>
    </section>
  )
}

export { StagesPricingSkeleton }
