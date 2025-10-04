import Skeleton from 'react-loading-skeleton'

interface TitleProps {
  children: React.ReactNode
  isLoading?: boolean
}

const Title = ({ children, isLoading = false }: TitleProps) => {
  if (isLoading) {
    return (
      <div className='w-[20rem] max-md:w-[25rem] h-[3.3rem] max-md:h-[4.125rem] flex items-center justify-center'>
        <Skeleton height='3.3rem' count={1} />
      </div>
    )
  }

  return (
    <h3 className='text-[3.438rem] max-md:text-[4.3rem] text-center font-bold text-transparent bg-clip-text bg-[image:var(--color-gradient-white-gray)]'>
      {children}
    </h3>
  )
}

export { Title }
