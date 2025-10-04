import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import styles from './TokenomicsBackground.module.scss'

const TokenomicsBackground = () => {
  return (
    <div className={styles.background}>
      <BackgroundLight
        className='w-[11.25rem] h-[11.125rem] blur-[8.125rem] top-[26.125rem] left-[29rem] !z-0'
        color='purple'
      />
    </div>
  )
}

export { TokenomicsBackground }
