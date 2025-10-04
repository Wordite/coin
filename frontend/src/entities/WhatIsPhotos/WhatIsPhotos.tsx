import { useSectionData } from '@/hooks/useSectionData'
import { Section } from '@/services/section.service'

const WhatIsPhotos = () => {
  const { data, isLoading, error } = useSectionData('WhatIsCoin')

  if (isLoading || error) {
    return (
      <div className='flex w-[45rem] flex-wrap gap-[2rem] max-md:w-full'>
        <div className='w-[21.25rem] h-[17.813rem] bg-gray-300 rounded-xxl animate-pulse max-md:w-[47%]' />
        <div className='w-[21.25rem] h-[17.813rem] bg-gray-300 rounded-xxl animate-pulse max-md:w-[47%]' />
        <div className='w-[21.25rem] h-[17.813rem] bg-gray-300 rounded-xxl animate-pulse max-md:w-[47%]' />
        <div className='w-[21.25rem] h-[17.813rem] bg-gray-300 rounded-xxl animate-pulse max-md:w-[47%]' />
      </div>
    )
  }

  return (
    <div className='what-is-photos flex w-[45rem] flex-wrap gap-[2rem] max-md:w-full'>
      {data.images.map((url: string) => (
        <img
          key={url}
          src={Section.getImageUrl(url)}
          className='w-[21.25rem] hover:scale-105 duration-300 max-md:w-[47%] h-[17.813rem] group flex items-center justify-center rounded-xxl bg-gray-transparent-10 border-1 border-stroke-dark'
        />
      ))}
    </div>
  )
}

export { WhatIsPhotos }
