import React from 'react'
import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import styles from './Partners.module.scss'
import { useSectionData } from '@/hooks/useSectionData'
import { Section } from '@/services/section.service'
import { useIsDesktopSafari } from '@/hooks/useIsDesktopSafari'

const Partners = React.memo(() => {
  const { data } = useSectionData('Partners')
  const isDesktopSafari = useIsDesktopSafari()

  return (
    <section id='partners' className='h-[8.75rem] mt-[12.8rem] rounded-xxl'>
      <div className='absolute left-0 w-screen h-[8.75rem] bg-gray-transparent-10 rounded-xxl overflow-hidden'>
        <div className='min-w-full h-[7.5rem] relative top-1/2 -translate-y-1/2 overflow-hidden'>
          {!isDesktopSafari && (
            <BackgroundLight
              color='green'
              className='left-[60%] -top-3/4 blur-[7.5rem] -translate-x-1/2 -translate-y-1/2'
            />
          )}

          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack}>
              {data?.images?.map((imageUrl: string, index: number) => (
                <div key={`first-${index}`} className={styles.partnerItem}>
                  <img
                    src={Section.getImageUrl(imageUrl)}
                    alt={`Partner ${index + 1}`}
                    className={styles.partnerImage}
                    loading='lazy'
                  />
                </div>
              ))}

              {data?.images?.map((imageUrl: string, index: number) => (
                <div key={`second-${index}`} className={styles.partnerItem}>
                  <img
                    src={Section.getImageUrl(imageUrl)}
                    alt={`Partner ${index + 1}`}
                    className={styles.partnerImage}
                    loading='lazy'
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

Partners.displayName = 'Partners'

export { Partners }
