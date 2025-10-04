import Skeleton from 'react-loading-skeleton'

interface SubtitleProps {
  children: React.ReactNode
  isLoading?: boolean
}

const Subtitle = ({ children, isLoading = false }: SubtitleProps) => {
  return (
    <p className='w-[32.125rem] max-md:w-[40rem] text-center text-white-transparent-75 text-[1rem] max-md:text-[1.5rem] leading-[150%]'>
      {isLoading ? <Skeleton height='1.5rem' count={2} /> : children}
    </p>
  )
}

export { Subtitle }
