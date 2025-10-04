import { useSectionData } from '@/hooks/useSectionData'
import { PresailDetailsInfoCard } from '../PresailDetailsInfoCard/PresailDetailsInfoCard'


const PresailDetailsInfo = () => {
  const { data } = useSectionData('PresaleDetails')

  return (
    <div className='flex mt-[3.125rem] justify-center gap-[1rem] max-md:flex-col max-md:gap-[2rem]'   >
        {data.details.map(({ textField1: title, textField2: subtitle }: { textField1: string, textField2: string }, index: number) => (
            <PresailDetailsInfoCard key={index} title={title} subtitle={subtitle} />
        ))}
    </div>
  )
}

export { PresailDetailsInfo }