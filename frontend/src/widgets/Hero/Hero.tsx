import { HeroBackground } from '@/entities/HeroBackground/HeroBackground'
import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import { HeroInformation } from '@/widgets/HeroInformation/HeroInformation'
import { PurchaseCoins } from '@/widgets/PurchaseCoins/PurchaseCoins'

const Hero = () => {
  return (
    <>
      <HeroBackground />

      <section id='hero' className='flex items-center justify-between h-screen max-md:h-auto relative max-md:flex-col max-md:justify-center' data-scroll-section>
        <HeroInformation />
        <PurchaseCoins />

        <BackgroundLight color='green' className='right-[-13.063rem] bottom-[14.313rem]' />
        <BackgroundLight color='purple' className='right-[4.813rem] top-[9.313rem]' />
      </section>
    </>
  )
}

export { Hero }
