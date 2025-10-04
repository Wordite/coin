import { PresailDetailsInfo } from '@/entities/PresaleDetailsInfo/PresailDetailsInfo'
import { useSectionData } from '@/hooks/useSectionData'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { PresailDetailsSkeleton } from './ui/PresailDetailsSkeleton'

const PresailDetails = () => {
  const { data, isLoading, error } = useSectionData('PresaleDetails')

  if (isLoading || error) return <PresailDetailsSkeleton />

  return (
    <section id='presale-details' className='mt-[18.75rem]'>
      <SectionHead
        title={data.title}
        withUnderline
        underlineWidth='w-[7.813rem]'
        subtitle={data.subtitle}
      />
      <PresailDetailsInfo />
    </section>
  )
}

export { PresailDetails }
