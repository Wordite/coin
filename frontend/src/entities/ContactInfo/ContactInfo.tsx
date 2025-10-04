import { Link } from 'react-router'
import { ReactSVG } from 'react-svg'
import { OurSocialMedia } from '@/entities/OurSocialMedia/OurSocialMedia'
import styles from './ContactInfo.module.scss'
import { useSectionData } from '@/hooks/useSectionData'
import { ContactInfoSkeleton } from './ui/ContactInfoSkeleton'
import { Section } from '@/services/section.service'

const ContactInfo = () => {
  const { data, isLoading, error } = useSectionData('SocialsAndContact')

  if (isLoading || error) return <ContactInfoSkeleton />

  return (
    <div className='w-[29.375rem] max-md:w-full max-md:mt-[3rem]'>
      <div className='flex flex-col gap-[1.25rem]'>
        {data.contactInfo.map(
          (
            {
              textField1: text,
              textField2: link,
              image: icon,
            }: { textField1: string; textField2: string; image: string },
            index: number
          ) => (
            <Link
              key={index}
              className={`${styles.social} flex items-center gap-[.938rem]`}
              to={link}
            >
              <ReactSVG
                beforeInjection={(svg) => {
                  svg.removeAttribute('width')
                  svg.removeAttribute('height')
                }}
                src={Section.getImageUrl(icon)}
                className=''
              />
              <p className='text-white-transparent-35 text-[1.25rem] max-md:text-[1.6rem] group-hover:text-white transition-all duration-300'>
                {text}
              </p>
            </Link>
          )
        )}
      </div>

      <OurSocialMedia className='mt-[2.375rem]' />
    </div>
  )
}

export { ContactInfo }
