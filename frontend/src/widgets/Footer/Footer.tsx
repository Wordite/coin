import { OurSocialMedia } from '@/entities/OurSocialMedia/OurSocialMedia'
import { TitleUnderline } from '@/shared/TitleUnderline/TitleUnderline'
import { ReactSVG } from 'react-svg'
import { Link } from 'react-router'
import styles from './Footer.module.scss'
import { FooterBackground } from '@/entities/FooterBackground/FooterBackground'
import { useSectionData } from '@/hooks/useSectionData'
import { FooterLinksRow } from '@/entities/FooterLinksRow/FooterLinksRow'
import { useTransformLinksRow } from './model/useTransformLinksRow'
import { FooterSkeleton } from './ui/FooterSkeleton'
import { useSettings } from '@/hooks'
import { Section } from '@/services/section.service'


const Footer = () => {
  const { data, isLoading, error } = useSectionData('Footer')
  const { transformLinks } = useTransformLinksRow()
  const { settings, isLoading: isSettingsLoading, error: isSettingsError } = useSettings()

  if (isLoading || error || isSettingsLoading || isSettingsError) return <FooterSkeleton />

  return (
    <footer id='footer' className='mt-[7rem] pb-[4.063rem] max-md:mt-[12rem] max-md:pb-[6rem]'>
      <FooterBackground />
      <TitleUnderline color='purple' width='w-[48.5rem] max-md:w-[90%] mx-auto' />

      <div className='mt-[5.625rem] max-md:mt-[8rem] flex max-md:flex-col max-md:gap-[4.5rem]'>
        <FooterLinksRow title={data.firstLinksSectionName} links={transformLinks(data.firstLinksSectionRow)} className='max-md:w-full' />
        <FooterLinksRow title={data.secondLinksSectionName} links={transformLinks(data.secondLinksSectionRow)} className='ml-[9.625rem] max-md:ml-0 max-md:w-full' />

        <div className='ml-[9.625rem] max-md:ml-0 flex flex-col max-md:mt-[2rem]'>
          <h6 className='text-white text-[1.25rem] max-md:text-[1.8rem] font-semibold'>Contract Address</h6>
          <span className='text-white-transparent-35 text-[1.25rem] max-md:text-[1.4rem] mt-[.938rem] max-md:mt-[1.2rem] underline'>
            {data.contractAddress}
          </span>

          <OurSocialMedia className='mt-auto max-md:mt-[2rem]' />
        </div>

        <div className='w-[16.875rem] max-md:w-full ml-auto flex flex-col items-end max-md:ml-0 max-md:items-center max-md:mt-[3rem]'>
          <Link to='/'>
            <ReactSVG
              src={Section.getImageUrl(settings!.siteLogo)}
              className={`${styles.icon} clickable hover:scale-105 transition-all duration-300 cursor-pointer`}
              beforeInjection={(svg) => {
                svg.removeAttribute('width')
                svg.removeAttribute('height')
              }}
            />
          </Link>

          <p className='text-white-transparent-35 text-[1.125rem] max-md:text-[1.4rem] mt-auto text-right max-md:text-center max-md:mt-[1.5rem]'>
            {data.rightBottomText}
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
