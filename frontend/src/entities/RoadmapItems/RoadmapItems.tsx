import { RoadmapItem } from '@/entities/RoadmapItem/RoadmapItem'
import { useSectionData } from '@/hooks/useSectionData'

interface RoadmapItemsProps {
  className?: string
}

const RoadmapItems = ({ className }: RoadmapItemsProps) => {
  const { data } = useSectionData('Roadmap')

  return (
    <div className={`flex flex-wrap gap-[6.875rem] justify-center max-md:flex-col max-md:gap-[2rem] max-md:items-center ${className}`}>
      {data.list.map(({ textField1: title, textField2: description }, index: number) => (
        <RoadmapItem key={index} number={index + 1} title={title} description={description} />
      ))}
    </div>
  )
}

export { RoadmapItems }
