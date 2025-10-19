const RoadmapSkeleton = () => {
  return (
    <section id='roadmap' className='mt-[18.75rem] relative max-md:mt-[14rem] transform-gpu will-change-contents'>
      {/* Background lights skeleton */}
      <div className='absolute top-[10rem] left-[15.938rem] w-[10rem] h-[10rem] bg-purple-500/20 rounded-full blur-[8.125rem] max-md:w-[6rem] max-md:h-[6rem]'></div>
      <div className='absolute bottom-[2rem] right-[15.938rem] w-[6rem] h-[6rem] bg-green-500/20 rounded-full blur-[6.125rem]'></div>

      {/* SectionHead skeleton */}
      <div className='flex flex-col items-center'>
        <div className='h-[3.438rem] w-[20rem] bg-gray-300 rounded animate-pulse max-md:h-[4.3rem] max-md:w-[25rem]' />
        
        <div className='mt-[.938rem] mb-[1.438rem] max-md:mt-[1.175rem] max-md:mb-[1.8rem]'>
          <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse' />
        </div>
      </div>

      {/* RoadmapItems skeleton */}
      <div className='flex flex-wrap gap-[6.875rem] justify-center mt-[2.5rem] max-md:flex-col max-md:gap-[2rem] max-md:items-center'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='flex items-center gap-[3.125rem] max-md:gap-[3.5rem]'>
            {/* Large number skeleton */}
            <div className='h-[10.063rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[12rem] max-md:w-[5rem]' />

            {/* Content skeleton */}
            <div className='w-[23.125rem] max-md:w-[28rem]'>
              {/* Title skeleton */}
              <div className='h-[1.25rem] w-[10rem] bg-gray-300 rounded animate-pulse max-md:h-[1.5rem]' />
              
              {/* TitleUnderline skeleton */}
              <div className='mt-[.938rem] max-md:mt-[1.1rem]'>
                <div className='h-[0.188rem] w-[7.813rem] bg-gray-300 rounded animate-pulse max-md:w-[9rem]' />
              </div>
              
              {/* Description skeleton */}
              <div className='mt-[1.125rem] max-md:mt-[1.4rem]'>
                <div className='h-[0.875rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[1.1rem] mb-2' />
                <div className='h-[0.875rem] w-[90%] bg-gray-300 rounded animate-pulse max-md:h-[1.1rem] mb-2' />
                <div className='h-[0.875rem] w-[80%] bg-gray-300 rounded animate-pulse max-md:h-[1.1rem]' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className='flex justify-center mt-[2.5rem] max-md:mt-[4rem]'>
        <div className='h-[3.438rem] w-[15rem] bg-gray-300 rounded-md animate-pulse max-md:w-full max-md:h-[4.6rem]' />
      </div>
    </section>
  )
}

export { RoadmapSkeleton }
