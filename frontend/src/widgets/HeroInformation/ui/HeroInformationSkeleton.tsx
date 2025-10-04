import { useIsMobile } from '@/hooks/useIsMobile'
import Skeleton from 'react-loading-skeleton'

const HeroInformationSkeleton = () => {
  const isMobile = useIsMobile()

  return (
    <div className='max-md:h-screen flex flex-col max-md:justify-center'>
      {/* Title skeleton */}
      <div className='max-md:mt-0 pb-[.313rem]'>
        <Skeleton height='4rem' width='36rem' className='max-md:h-[4rem] max-md:w-[90%] mb-2' />
        <Skeleton height='4rem' width='36rem' className='max-md:h-[4rem] max-md:w-[90%] mb-2' />
        <Skeleton height='4rem' width='28rem' className='max-md:h-[4rem] max-md:w-[80%]' />
      </div>

      {/* Subtitle skeleton */}
      <div className='w-[36.125rem] max-md:w-full mt-[1.5rem]'>
        <Skeleton height='1.125rem' width='100%' className='max-md:h-[1.3rem] mb-2' />
        <Skeleton height='1.125rem' width='90%' className='max-md:h-[1.3rem] mb-2' />
        <Skeleton height='1.125rem' width='85%' className='max-md:h-[1.3rem] mb-2' />
        <Skeleton height='1.125rem' width='70%' className='max-md:h-[1.3rem]' />
      </div>

      {/* Buttons skeleton */}
      <div className='flex max-md:flex-col w-full items-center gap-[1.8rem] mt-[4.3rem] max-md:mt-[10rem]'>
        {!isMobile ? (
          <>
            <Skeleton
              height='3.43rem'
              width='12.8rem'
              className='w-[12.8rem] h-[3.43rem] max-md:w-full max-md:h-[4.62rem]'
            />

            <Skeleton
              height='3.43rem'
              width='12.8rem'
              className='w-[12.8rem] h-[3.43rem] max-md:w-full max-md:h-[4.62rem]'
            />
          </>
        ) : (
          <>
            <Skeleton  className='block h-[4.62rem] min-w-[90vw]' />
            <Skeleton className='block h-[4.62rem] min-w-[90vw]' />
          </>
        )}
      </div>
    </div>
  )
}
export default HeroInformationSkeleton
