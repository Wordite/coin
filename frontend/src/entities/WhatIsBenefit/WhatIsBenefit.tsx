import { Section } from '@/services/section.service'

interface WhatIsBenefitProps {
  title: string
  description: string
  icon: string
  isLast?: boolean
}

const WhatIsBenefit = ({ title, description, icon, isLast = false }: WhatIsBenefitProps) => {
  return (
    <figure className='what-is-benefit w-[28.75rem] flex gap-[1.125rem] max-md:w-[95%] max-md:mx-auto max-md:gap-[1.5rem] relative'>
      <div className='flex flex-col items-center'>
        <div className='w-[3.938rem] h-[3.938rem] max-md:w-[5.5rem] max-md:h-[5.5rem] bg-[image:var(--color-gradient-purple-blue-3)] rounded-full relative z-10'>
          <img
            src={Section.getImageUrl(icon)}
            alt={title}
            className='w-[1.5rem] h-[1.188rem] max-md:w-[2.8rem] max-md:h-[2.2rem] [&>path]:fill-dark-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          />
        </div>

        {!isLast && (
          <div className='absolute top-[3.938rem] max-md:top-[5.5rem] transform -translate-x-1/2 w-[.125rem] h-[calc(100%+1.125rem)] max-md:h-[calc(100%+4.5rem)] bg-gray-300 z-0' />
        )}
      </div>

      <div className='flex-1'>
        <h4 className='text-[1.688rem] max-md:text-[2.5rem] font-bold'>{title}</h4>
        <p className='text-white-transparent-75 text-[.875rem] max-md:text-[1.25rem] leading-[150%] mt-[.313rem] max-md:mt-[.4rem]'>
          {description}
        </p>
      </div>
    </figure>
  )
}

export { WhatIsBenefit }
