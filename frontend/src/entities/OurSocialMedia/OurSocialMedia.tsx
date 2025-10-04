import { Link } from 'react-router'
import { ReactSVG } from 'react-svg'
import styles from './OurSocialMedia.module.scss'
import { useSectionData } from '@/hooks/useSectionData'
import { Section } from '@/services/section.service'

interface OurSocialMediaProps {
  className?: string
}

const OurSocialMedia = ({ className }: OurSocialMediaProps) => {
  const { data, isLoading, error } = useSectionData('SocialsAndContact')

  if (isLoading || error) return null

  return (
    <div className={className}>
      <p className='text-[1.25rem] font-semibold mt-[2.375rem] max-md:text-[1.6rem]'>Our Social Media:</p>

      <div className='flex gap-[1.5rem] mt-[.688rem]'>
        {data.socails.map(
          ({ textField1: link, image: icon }: { textField1: string, image: string }, index: number) => (
            <Link key={index} to={link}>
              <ReactSVG src={Section.getImageUrl(icon)} className={styles.icon} beforeInjection={(svg) => {
                svg.removeAttribute('width')
                svg.removeAttribute('height')
              }} />
            </Link>
          )
        )}
      </div>
    </div>
  )
}

export { OurSocialMedia }
