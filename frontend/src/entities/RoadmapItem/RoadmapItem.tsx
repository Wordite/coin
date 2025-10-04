import { TitleUnderline } from '@/shared/TitleUnderline/TitleUnderline'

interface RoadmapItemProps {
  number: number
  title: string
  description: string
}

const RoadmapItem = ({ number, title, description }: RoadmapItemProps) => {
  return (
    <div className='flex items-center gap-[3.125rem] max-md:gap-[3.5rem] hover:scale-105 hover:translate-y-[-0.625rem] duration-300'>
        <p className='text-[10.063rem] max-md:text-[12rem] font-light bg-clip-text text-transparent bg-[image:var(--color-gradient-white-linear)]'>{number}</p>

        <div className='w-[23.125rem] max-md:w-[28rem]'>
            <h5 className='text-[1.25rem] max-md:text-[1.5rem] font-medium'>{title}</h5>
            <TitleUnderline color='white' width='w-[7.813rem] max-md:w-[9rem]' className='mt-[.938rem] max-md:mt-[1.1rem]' />

            <p className='text-[.875rem] max-md:text-[1.1rem] mt-[1.125rem] max-md:mt-[1.4rem] leading-[150%] text-white-transparent-75'>{description}</p>
        </div>
    </div>
  )
}

export { RoadmapItem, type RoadmapItemProps }