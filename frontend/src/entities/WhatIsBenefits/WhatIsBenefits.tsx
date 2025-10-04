import { useSectionData } from '@/hooks/useSectionData'
import { WhatIsBenefit } from '../WhatIsBenefit/WhatIsBenefit'
import { WhatIsBenefitsSkeleton } from './ui/WhatIsBenefitsSkeleton'

const WhatIsBenefits = () => {
  const { data, isLoading, error } = useSectionData('WhatIsCoin')

  if (isLoading || error) {
    return <WhatIsBenefitsSkeleton />
  }

  return (
    <div className='what-is-benefits flex flex-col gap-[1.125rem] max-md:gap-[4.5rem] max-md:mt-[2.5rem] relative'>
      {data.infos.map(({ textField1: title, textField2: description, image }: { textField1: string, textField2: string, image: string }, index: number) => (
        <WhatIsBenefit key={index} title={title} description={description} icon={image} isLast={index === data.infos.length - 1} />
      ))}
    </div>
  )
}

export { WhatIsBenefits }
