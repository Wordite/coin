import React from 'react'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { StakingCard } from '@/entities/StakingCard/StakingCard'
import Button from '@/shared/Button'
import { useSectionData } from '@/hooks/useSectionData'
import { StakingSkeleton } from './ui/StakingSkeleton'

const Staking = React.memo(() => {
  const { data, isLoading, error } = useSectionData('Staking')

  if (isLoading || error) {
    return <StakingSkeleton />
  }

  return (
    <section id='staking' className='mt-[12rem]'>
      <SectionHead
        title={data.title}
        withUnderline
        underlineWidth='w-[7.813rem]'
        subtitle={data.subtitle}
      />

      <div className='flex justify-between mt-[4.375rem] max-md:gap-[2rem] max-md:justify-center max-md:flex-col max-md:items-center'>
        
        {data.tiers.map(({textField1: title, textField2: lock, textField3: apy}: {textField1: string, textField2: string, textField3: string}) => (
          <StakingCard key={title} title={title} lock={lock} apy={apy} />
        ))}
      </div>

      <div className='flex justify-center gap-[1.688rem] mt-[4.375rem] max-md:flex-col'>
        <Button isLink to={data.stakingPoolLink} target='_blank' color='white' className='w-[13rem] h-[3.438rem] max-md:w-full max-md:h-[4.6rem]'>
          Staking pool
        </Button>
        <Button isLink to={'/docs'} target='_blank' color='dark' className='w-[13rem] h-[3.438rem] max-md:w-full max-md:h-[4.6rem]'>
          Documentation
        </Button>
      </div>
    </section>
  )
})

Staking.displayName = 'Staking'

export { Staking }
