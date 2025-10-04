import { WhatIsCoin } from '@/widgets/WhatIsCoin/WhatIsCoin'
import { Hero } from '@/widgets/Hero/Hero'
import { OurBenefits } from '@/widgets/OurBenefits/OurBenefits'
import { Staking } from '@/widgets/Staking/Staking'
import { Tokenomics } from '@/widgets/Tokenomics/Tokenomics'
import { PresailDetails } from '@/widgets/PresaleDetails/PresailDetails'
import { StagesPricing } from '@/widgets/StagesPricing/StagesPricing'
import { Roadmap } from '@/widgets/Roadmap/Roadmap'
import { Partners } from '@/widgets/Partners/Partners'
import { Contact } from '@/widgets/Contact/Contact'
import { FAQ } from '@/widgets/FAQ/FAQ'

const Home = () => {
  return (
    <>
      <Hero />
      <WhatIsCoin />
      <OurBenefits />
      <Staking />
      <Tokenomics />
      <PresailDetails />
      <StagesPricing />
      <Roadmap />
      <Partners />
      <Contact />
      <FAQ />
    </>
  )
}

export { Home }
