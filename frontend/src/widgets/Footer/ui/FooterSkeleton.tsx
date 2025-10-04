const FooterSkeleton = () => {
  return (
    <footer id='footer' className='mt-[7rem] pb-[4.063rem] max-md:mt-[12rem] max-md:pb-[6rem]'>
      {/* TitleUnderline skeleton */}
      <div className='h-[0.188rem] bg-gray-300 rounded w-[48.5rem] mx-auto animate-pulse max-md:w-[90%]' />

      <div className='mt-[5.625rem] max-md:mt-[8rem] flex max-md:flex-col max-md:gap-[4.5rem]'>
        {/* First FooterLinksRow skeleton */}
        <div className='max-md:w-full'>
          <div className='h-[1.25rem] bg-gray-300 rounded w-32 mb-4 animate-pulse max-md:h-[1.8rem]' />
          <nav>
            <ul className='flex flex-col gap-[1.563rem]'>
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={index}>
                  <div className='h-[1rem] bg-gray-200 rounded w-24 animate-pulse max-md:h-[1.4rem]' />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Second FooterLinksRow skeleton */}
        <div className='ml-[9.625rem] max-md:ml-0 max-md:w-full'>
          <div className='h-[1.25rem] bg-gray-300 rounded w-28 mb-4 animate-pulse max-md:h-[1.8rem]' />
          <nav>
            <ul className='flex flex-col gap-[1.563rem]'>
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index}>
                  <div className='h-[1rem] bg-gray-200 rounded w-20 animate-pulse max-md:h-[1.4rem]' />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contract Address section skeleton */}
        <div className='ml-[9.625rem] max-md:ml-0 flex flex-col max-md:mt-[2rem]'>
          <div className='h-[1.25rem] bg-gray-300 rounded w-36 mb-4 animate-pulse max-md:h-[1.8rem]' />
          <div className='h-[1.25rem] bg-gray-200 rounded w-64 mb-8 animate-pulse max-md:h-[1.4rem]' />

          {/* OurSocialMedia skeleton */}
          <div className='mt-auto max-md:mt-[2rem] flex gap-[1.5rem]'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='w-[1.5rem] h-[1.5rem] bg-gray-300 rounded animate-pulse max-md:w-[2rem] max-md:h-[2rem]' />
            ))}
          </div>
        </div>

        {/* Logo and bottom text section skeleton */}
        <div className='w-[16.875rem] max-md:w-full ml-auto flex flex-col items-end max-md:ml-0 max-md:items-center max-md:mt-[3rem]'>
          {/* Logo skeleton */}
          <div className='w-[2.625rem] h-[2.625rem] bg-gray-300 rounded animate-pulse' />

          {/* Bottom text skeleton */}
          <div className='mt-auto text-right max-md:text-center max-md:mt-[1.5rem]'>
            <div className='h-[1.125rem] bg-gray-200 rounded w-48 mb-2 animate-pulse max-md:h-[1.4rem]' />
            <div className='h-[1.125rem] bg-gray-200 rounded w-32 animate-pulse max-md:h-[1.4rem]' />
          </div>
        </div>
      </div>
    </footer>
  )
}

export { FooterSkeleton }
