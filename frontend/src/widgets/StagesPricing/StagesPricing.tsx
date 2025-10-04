import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { StagesCards } from '@/entities/StagesCards/StagesCards'
import { useSectionData } from '@/hooks/useSectionData'
import { StagesPricingSkeleton } from './ui/StagesPricingSkeleton'

const StagesPricing = () => {
  const { data, isLoading, error } = useSectionData('StagesPricing')

  if (isLoading || error) return <StagesPricingSkeleton />

  return (
    <section id='stages-pricing' className='mt-[4.375rem] max-md:mt-[10rem]'>
      <SectionHead title={data.title} withUnderline underlineWidth='w-[7.813rem]' />
      <StagesCards />
    </section>
  )
}

export { StagesPricing }
