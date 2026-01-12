import Button from '@/shared/Button'
import { useHeaderScrollWatcher } from './model/useHeaderScrollWatcher'
import { Links } from './ui/Links'
import { NestedLinks } from './ui/NestedLinks'
import { Links as LinksConfig } from '@/config/links'
import { HomeLinks } from '@/config/homeLinks'
import { AnchorLink } from '@/shared/AnchorLink'
import { Profile } from './ui/Profile'
import { useSettings } from '@/hooks/useSettings'
import { Section } from '@/services/section.service'
import { HeaderSkeleton } from './ui/HeaderSkeleton'
import { MobileMenu } from './ui/MobileMenu'
import { Burger } from './ui/Burger'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHeaderStore } from '@/app/store/headerStore'
import { useSectionData } from '@/hooks'
import { useAppKit } from '@reown/appkit/react'
import { useState, useEffect } from 'react'
import { useToast } from '@/shared/Toast'
import { useWalletStore } from '@/app/store/walletStore'
import { useServerAccount } from './model/useServerAccount'
import { ReactSVG } from 'react-svg'
// import { useIsSafari } from './model/useIsSafari'
import './Header.scss'

const Header = () => {
  useHeaderScrollWatcher()
  const { open } = useAppKit()
  const { isConnected } = useWalletStore()
  const { settings, isLoading, error } = useSettings()
  const isMobile = useIsMobile()
  const [isConnecting, setIsConnecting] = useState(false)
  const {
    isLoading: isHeaderLinksLoading,
    error: headerLinksError,
  } = useSectionData('HeaderLinks')
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useHeaderStore()
  const { showError} = useToast()
  useServerAccount()
  
  const isSafari = false
  // const isSafari = useIsSafari()

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen, setIsMobileMenuOpen])

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true)
      await open({ view: 'Connect' })
    } catch (error) {
      showError('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading || isHeaderLinksLoading || headerLinksError || error) return <HeaderSkeleton />

  return (
    <>
      <header
        className={`header transform-gpu fixed top-0 left-0 w-full flex items-center z-40 ${
          isMobileMenuOpen ? 'mobile-menu-open' : ''
        } ${isSafari ? 'safari' : ''}`}
      >
        <div className='container flex items-center h-full justify-between'>
          <AnchorLink href={LinksConfig.Home} onClick={() => setIsMobileMenuOpen(false)}>
            <div className='clickable cursor-pointer'>
            {/* <div className='clickable cursor-pointer w-[3.188rem] h-[3.188rem]'> */}
            {/* Changed logo image to sitename */}
            {/* <ReactSVG
                beforeInjection={(svg) => {
                  svg.removeAttribute('width')
                  svg.removeAttribute('height')
                }}
                src={Section.getImageUrl(settings!.siteLogo)}
                className='w-full h-full'
              /> */}
              <span className='text-white text-[1.35rem] max-md:text-[1.5rem] font-semibold'>
                {settings!.siteName}
              </span>
            </div>
          </AnchorLink>

          {isMobile ? <Burger /> : <Links />}

          {!isMobile &&
            (isConnected ? (
              <Profile />
            ) : (
              <Button
                color='purple'
                className='w-[12.313rem] h-[2.938rem]'
                onClick={handleConnectWallet}
                loadingText='Connecting...'
                isLoading={isConnecting}
              >
                Connect Wallet
              </Button>
            ))}
        </div>
      </header>

      <NestedLinks links={HomeLinks.nestedLinks} targetLabel={HomeLinks.label} />

      {isMobile && <MobileMenu />}
    </>
  )
}

export { Header }
