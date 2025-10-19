import React from 'react'
import { OurBenefitsBackground } from '@/entities/OurBenefitsBackground/OurBenefitsBackground'
import { Advantage } from '@/entities/Advantage/Advantage'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { useSectionData } from '@/hooks/useSectionData'
import { OurBenefitsSkeleton } from './ui/OurBenefitsSkeleton'

const OurBenefits = React.memo(() => {
  const { data, isLoading, error } = useSectionData('Benefits')
  
  if (isLoading || error) {
    return <OurBenefitsSkeleton />
  }

  return (
    <section id='our-benefits' className='flex flex-col mt-[6rem]'>
      <OurBenefitsBackground />

      <SectionHead
        title={data?.title}
        withUnderline
        underlineWidth='w-[17.625rem]'
        className='mt-[5.5rem]'
        isLoading={isLoading}
      />

      <div className='advantages-container flex justify-between mt-[5.625rem] max-md:flex-col max-md:gap-[7rem] max-md:items-center'>
        {data.benefits.map(({ textField1: title, textField2: description, image }: { textField1: string, textField2: string, image: string }, index: number) => (
        <Advantage
          key={index}
          title={title}
          description={description}
          icon={image}
        />
        ))}
      </div>
    </section>
  )
})

OurBenefits.displayName = 'OurBenefits'

export { OurBenefits }
