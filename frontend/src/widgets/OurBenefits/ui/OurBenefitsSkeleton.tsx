const OurBenefitsSkeleton = () => {
  return (
    <div className='flex flex-col mt-[6rem]'>
      <div className='flex flex-col items-center gap-[1.125rem] max-md:mt-[2rem]'>
        <div className='h-[3.3rem] w-[17.625rem] bg-gray-300 rounded animate-pulse' />
        <div className='h-[1.688rem] w-[23.75rem] bg-gray-300 rounded animate-pulse' />
      </div>
      
      <div className='flex justify-between mt-[5.625rem] max-md:flex-col max-md:gap-[7rem] max-md:items-center'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='flex flex-col items-center w-[23.75rem] max-md:w-[95%]'>
            <div className='w-[7.188rem] h-[7.188rem] bg-gray-300 rounded-xxl animate-pulse max-md:w-[11rem] max-md:h-[11rem]' />
            
            <div className='h-[1.688rem] w-[15rem] bg-gray-300 rounded animate-pulse mt-[1rem] max-md:mt-[1.25rem] max-md:h-[2.5rem] max-md:w-[18rem]' />
            
            <div className='mt-[1rem]'>
              <div className='h-[.875rem] w-[18rem] bg-gray-300 rounded animate-pulse max-md:h-[1.25rem] max-md:w-[20rem] mb-2' />
              <div className='h-[.875rem] w-[16rem] bg-gray-300 rounded animate-pulse max-md:h-[1.25rem] max-md:w-[18rem]' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { OurBenefitsSkeleton }
