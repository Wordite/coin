import LockIcon from '@/assets/icons/lock.svg'
import { Section } from '@/services/section.service'

interface StakingCardProps {
  title: string
  lock: string
  apy: string
  image: string
}

const StakingCard = ({ title, lock, apy, image }: StakingCardProps) => {

  return (
    <div className='w-[16.875rem] h-[14rem] max-md:h-[20rem] overflow-hidden relative p-[1.188rem] max-md:w-[90%] group hover:scale-105 hover:translate-y-[-0.625rem] hover:border-stroke-light transition-all duration-300 bg-gray-transparent-10 border-1 border-stroke-dark rounded-xxl'>
      <div className='flex justify-between items-center'>
        <p className='text-[1.125rem] max-md:text-[1.65rem]  font-bold [text-rendering:geometricPrecision]'>{title}</p>
        <div className='flex gap-[0.5rem] justify-center items-center px-[0.5rem] py-[.375rem] border-1 border-stroke-dark rounded-sm bg-gray-transparent-70'>
          <LockIcon className='w-[.75rem] h-[.875rem] max-md:w-[0.99rem] max-md:h-[1.045rem] [&>path]:fill-white-transparent-75' />
          <p className='text-white-transparent-75 text-[.75rem] max-md:text-[1.1rem] [text-rendering:geometricPrecision] leading-[1em]'>{lock}</p>
        </div>
      </div>

      <p className='font-medium text-[1.25rem] max-md:text-[1.54rem] [text-rendering:geometricPrecision] bg-clip-text text-transparent bg-[image:var(--color-gradient-green)] mt-[1rem]'>
        {apy} 
      </p>

      <img src={Section.getImageUrl(image)} alt={title} className='w-full h-[7rem] max-md:h-[11rem] object-cover absolute bottom-0 left-0' />
    </div>
  )
}

export { StakingCard }
