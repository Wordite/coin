import Button from '@/shared/Button'
import { useSectionData } from '@/hooks/useSectionData'
import HeroInformationSkeleton from './ui/HeroInformationSkeleton'
import { useSettings, useMapSettings } from '@/hooks'
import { Section } from '@/services/section.service'

const HeroInformation = () => {
  const { data, isLoading, error } = useSectionData('Hero')
  const { settings } = useSettings()
  const { mapSettings } = useMapSettings()

  if (isLoading || error) return <HeroInformationSkeleton />

  return (
    <div className='max-md:min-h-screen flex flex-col max-md:justify-center'>
      <img
        src={Section.getImageUrl(settings?.siteLogo || '')}
        className='w-[14rem] h-[14rem] max-md:w-[15rem] max-md:h-[15rem] mb-[2rem]'
      />

      <h1 className='text-[4rem] max-md:text-[4rem] font-bold max-md:mt-0 pb-[.313rem] leading-[105%] text-transparent bg-clip-text [background-image:var(--color-gradient-purple-blue)]'>
        {data?.title}
      </h1>

      <p className='text-white-transparent-75 text-[1.125rem] max-md:text-[1.3rem] w-[36.125rem] leading-[150%] mt-[1.5rem] max-md:w-full'>
        {data?.subtitle}
      </p>

      <div className='flex max-md:flex-col items-center gap-[1.8rem] mt-[4.3rem] max-md:mt-[10rem]'>
        <Button
          isLink
          to='https://app.tycoin.app'
          color='purple'
          target='_blank'
          className='w-[12.8rem] h-[3.43rem] max-md:w-full max-md:h-[4.62rem]'
        >
          {mapSettings?.title || 'Tycoin Land'}
        </Button>

        <Button
          isLink
          to={data?.docsUrl}
          color='white'
          className='w-[12.8rem] h-[3.43rem] max-md:w-full max-md:h-[4.62rem]'
        >
          Documentation
        </Button>
      </div>
    </div>
  )
}

export { HeroInformation }
