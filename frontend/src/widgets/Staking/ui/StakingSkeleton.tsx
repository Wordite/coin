const StakingSkeleton = () => {
  return (
    <section id='staking' className='mt-[12rem]'>
      <div className='flex flex-col items-center'>
        <div className='h-[2.5rem] w-[15rem] bg-gray-300 rounded animate-pulse' />
        
        <div className='mt-[.938rem] mb-[1.438rem]'>
          <div className='h-[0.25rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
        </div>
        
        <div className='h-[1.25rem] w-[20rem] bg-gray-300 rounded animate-pulse' />
      </div>

      <div className='flex justify-between mt-[4.375rem] max-md:gap-[2rem] max-md:justify-center max-md:flex-col max-md:items-center'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='w-[16.875rem] h-[8.375rem] max-md:h-[10.23rem] p-[1.188rem] bg-gray-transparent-10 border-1 border-stroke-dark rounded-xxl max-md:w-[90%]'>
            <div className='flex justify-between items-center'>
              <div className='h-[1.125rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.65rem]' />
              
              <div className='flex gap-[0.5rem] justify-center items-center px-[0.5rem] py-[.375rem] border-1 border-stroke-dark rounded-sm bg-gray-transparent-70'>
                <div className='w-[0.75rem] h-[0.875rem] bg-gray-300 rounded-full animate-pulse max-md:w-[0.99rem] max-md:h-[1.045rem]' />
                <div className='h-[0.75rem] w-[3rem] bg-gray-300 rounded animate-pulse max-md:h-[1.1rem]' />
              </div>
            </div>
            
            <div className='mt-[1rem]'>
              <div className='h-[1.25rem] w-[6rem] bg-gray-300 rounded animate-pulse max-md:h-[1.54rem]' />
            </div>
            
            <div className='mt-[.125rem]'>
              <div className='h-[0.813rem] w-[4rem] bg-gray-300 rounded animate-pulse max-md:h-[1.21rem]' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-center gap-[1.688rem] mt-[4.375rem] max-md:flex-col'>
        <div className='h-[3.438rem] w-[13rem] bg-gray-300 rounded-md animate-pulse max-md:w-full max-md:h-[4.6rem]' />
        <div className='h-[3.438rem] w-[13rem] bg-gray-300 rounded-md animate-pulse max-md:w-full max-md:h-[4.6rem]' />
      </div>
    </section>
  )
}

export { StakingSkeleton }