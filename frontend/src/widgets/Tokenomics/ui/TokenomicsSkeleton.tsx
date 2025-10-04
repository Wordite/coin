const TokenomicsSkeleton = () => {
  return (
    <>
      <div className='absolute inset-0 -z-10' />
      
      <section id='tokenomics' className='mt-[14.875rem]'>
        <div className='flex flex-col items-center'>
          <div className='h-[3.438rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[4.3rem] max-md:w-[25rem]' />
          <div className='mt-[.938rem] mb-[1.438rem] max-md:mt-[1.175rem] max-md:mb-[1.8rem]'>
            <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
          </div>
        </div>

        <div className='flex justify-between items-center mt-[6.875rem] max-md:flex-col max-md:gap-[13rem]'>
          <div className='relative'>
            <div className='ml-[10rem] max-md:ml-0'>
              <div className='w-[26.625rem] h-[26.625rem] bg-gray-300 rounded-full animate-pulse max-md:w-[22rem] max-md:h-[22rem]' />
            </div>
            <div className='w-[13.75rem] h-[13.75rem] absolute top-1/2 left-[calc(50%+5rem)] max-md:left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10'>
              <div className='w-[13.75rem] h-[13.75rem] bg-gray-300 rounded-full animate-pulse max-md:w-[10rem] max-md:h-[10rem]' />
            </div>
          </div>

          <div className='mb-[3rem]'>
            <div className='flex flex-col gap-[1.57rem]'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='w-[32.75rem] max-md:w-full'>
                  <div className='flex group items-end'>
                    {/* Percentage */}
                    <div className='h-[1.688rem] w-[5rem] bg-gray-300 rounded animate-pulse max-md:h-[1.8rem] max-md:w-[6rem]' />
                    
                    {/* Name */}
                    <div className='ml-[1rem] max-md:ml-[1rem]'>
                      <div className='h-[1.688rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.8rem]' />
                    </div>
                    
                    {/* Count of Tokens */}
                    <div className='ml-auto max-md:pl-[2rem]'>
                      <div className='h-[0.75rem] w-[6rem] bg-gray-300 rounded animate-pulse max-md:h-[1rem]' />
                    </div>
                  </div>
                  
                  {/* Underline */}
                  <div className='h-[0.188rem] w-full bg-gray-300 rounded animate-pulse mt-[.625rem] max-md:h-[0.25rem] max-md:mt-[0.8rem]' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export { TokenomicsSkeleton }