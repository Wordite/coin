import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAnimations } from '@/hooks/useAnimations'
import { Header } from '@/widgets/Header/Header'
import { Footer } from '@/widgets/Footer/Footer'
import { destroyLocomotiveScroll } from '@/app/animations/locomotive'
import { SelectWalletModal } from '@/widgets/SelectWalletModal/SelectWalletModal'
import { clickAnimation } from './animations/click'
import { CookieBanner } from '@/widgets/CookieBanner/CookieBanner'
import { useSettings } from '@/hooks'
import { Section } from '@/services/section.service'

const Container = () => {
  const { init } = useAnimations()
  const location = useLocation()
  const { settings } = useSettings()

  useEffect(() => {
    init()

    return () => {
      destroyLocomotiveScroll()
    }
  }, [])

  useEffect(() => {
    clickAnimation()
  }, [location.pathname])

  useEffect(() => {
    if (settings?.siteLogo) {
      const link =
        (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
        document.createElement('link')
      link.type = 'image/svg+xml'
      link.rel = 'shortcut icon'
      link.href = Section.getImageUrl(settings.siteLogo)
      document.getElementsByTagName('head')[0].appendChild(link)
    }

    if (settings?.siteName) {
      document.title = settings.siteName
    }
  }, [settings])

  return (
    <>
      <main className='layout container' data-scroll-container>
        <Header />
        {/* <SelectWalletModal /> */}
        <Outlet />
        <Footer />
        <CookieBanner />
      </main>
    </>
  )
}

export { Container }
