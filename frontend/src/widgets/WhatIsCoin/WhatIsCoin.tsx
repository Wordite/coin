import React from 'react'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { WhatIsBenefits } from '@/entities/WhatIsBenefits/WhatIsBenefits'
import { WhatIsPhotos } from '@/entities/WhatIsPhotos/WhatIsPhotos'
import { useSectionData } from '@/hooks/useSectionData'

const WhatIsCoin = React.memo(() => {
  const { data, isLoading } = useSectionData('WhatIsCoin')

  return (
    <section id='what-is-coin' className='flex flex-col mt-[5rem] max-md:mt-[12rem]'>
      <SectionHead
        title={data?.title}
        withUnderline
        underlineWidth='w-[17.625rem]'
        subtitle={data?.subtitle}
        isLoading={isLoading}
      />

      <div className='flex justify-between mt-[5rem] items-center max-md:flex-col max-md:gap-[3rem]'>
        <WhatIsPhotos />
        <WhatIsBenefits />
      </div>
    </section>
  )
})

WhatIsCoin.displayName = 'WhatIsCoin'

export { WhatIsCoin }
