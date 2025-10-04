import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import styles from './OurBenefitsBackground.module.scss'

const OurBenefitsBackground = () => {
  return (
    <div className={styles.background}>
      <BackgroundLight
        className='w-[31.25rem] h-[31.25rem] blur-[8.125rem] opacity-80 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !z-10'
        color='purple'
      />
    </div>
  )
}

export { OurBenefitsBackground }
