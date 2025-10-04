

const ContactInfoSkeleton = () => {
  return (
    <div className='w-[29.375rem] max-md:w-full max-md:mt-[3rem]'>
      {/* Contact info items skeleton */}
      <div className='flex flex-col gap-[1.25rem]'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='flex items-center gap-[.938rem]'>
            {/* Icon skeleton */}
            <div className='w-[1.5rem] h-[1.5rem] bg-gray-300 rounded animate-pulse max-md:w-[2rem] max-md:h-[2rem]' />
            
            {/* Text skeleton */}
            <div className='h-[1.25rem] w-[12rem] bg-gray-300 rounded animate-pulse max-md:h-[1.6rem]' />
          </div>
        ))}
      </div>

      {/* OurSocialMedia skeleton */}
      <div className='mt-[2.375rem]'>
        {/* Title skeleton */}
        <div className='h-[1.25rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.6rem]' />

        {/* Social media icons skeleton */}
        <div className='flex gap-[1.5rem] mt-[.688rem]'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='w-[1.5rem] h-[1.5rem] bg-gray-300 rounded animate-pulse max-md:w-[2rem] max-md:h-[2rem]' />
          ))}
        </div>
      </div>
    </div>
  )
}

export { ContactInfoSkeleton }
