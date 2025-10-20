import { Section } from '@/services/section.service'

interface AdvantageProps {
  title: string
  description: string
  icon: string
}

const Advantage = ({ title, description, icon }: AdvantageProps) => {
  return (
    <div className='flex flex-col items-center w-[23.75rem] max-md:w-[95%] group hover:translate-y-[-0.625rem] transition-all duration-300'>
      <div className='w-[7.188rem] h-[7.188rem] max-md:w-[11rem] max-md:h-[11rem] bg-gray-transparent-50 rounded-xxl relative border-1 border-stroke-dark group-hover:border-stroke-light transition-all duration-300'>
        <img
          src={Section.getImageUrl(icon)}
          alt={title}
          className='w-[4rem] h-[3.125rem] max-md:w-[5.5rem] max-md:h-[4.25rem] group-hover:scale-110 transition-all duration-300 [&>path]:fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        />
      </div>

      <h4 className='text-white text-[1.688rem] max-md:text-[3rem] font-bold mt-[1rem] max-md:mt-[1.25rem] text-center'>
        {title}
      </h4>

      <p className='text-white-transparent-75 text-[.875rem] max-md:text-[1.5rem] text-center leading-[150%] mt-[1rem]'>
        {description}
      </p>
    </div>
  )
}

export { Advantage }
