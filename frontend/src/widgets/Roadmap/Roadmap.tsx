import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { RoadmapItems } from '@/entities/RoadmapItems/RoadmapItems'
import Button from '@/shared/Button'
import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import { useSectionData } from '@/hooks/useSectionData'
import { RoadmapSkeleton } from './ui/RoadmapSkeleton'

const Roadmap = () => {
  const { data, isLoading, error } = useSectionData('Roadmap')

  if (isLoading || error) return <RoadmapSkeleton />

  return (
    <section id='roadmap' className='mt-[18.75rem] relative max-md:mt-[14rem]'>
      <BackgroundLight
        className='!w-[10rem] !h-[10rem] blur-[8.125rem] top-[10rem] left-[15.938rem] max-md:w-[6rem] max-md:h-[6rem]'
        color='purple'
      />

      <BackgroundLight
        className='!w-[6rem] !h-[6rem] blur-[6.125rem] bottom-[2rem] right-[15.938rem] max-md:w-[6rem] max-md:h-[6rem]'
        color='green'
      />

      <SectionHead title={data.title} withUnderline underlineWidth='w-[7.813rem]' />
      <RoadmapItems className='mt-[2.5rem]' />

      <Button isLink to={data.link} color='white' className='mt-[2.5rem] max-md:mt-[4rem] mx-auto w-[15rem] max-md:w-full max-md:h-[4.6rem]'>
        Full Roadmap
      </Button>
    </section>
  )
}

export { Roadmap }
