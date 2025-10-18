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
import './Header.scss'
import { HeaderSkeleton } from './ui/HeaderSkeleton'
import { MobileMenu } from './ui/MobileMenu'
import { Burger } from './ui/Burger'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHeaderStore } from '@/app/store/headerStore'
import { useSectionData } from '@/hooks'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState } from 'react'
import { useToast } from '@/shared/Toast'
import { useWalletStore } from '@/app/store/walletStore'
import { useServerAccount } from './model/useServerAccount'

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


  const { address } = useAppKitAccount()
  console.log('appkit account address:', address)


  if (isLoading || isHeaderLinksLoading || headerLinksError || error) return <HeaderSkeleton />

  return (
    <>
      <header
        className={`header transform-gpu fixed top-0 left-0 w-full flex items-center z-40 ${
          isMobileMenuOpen ? 'mobile-menu-open' : ''
        }`}
      >
        <div className='container flex items-center h-full justify-between'>
          <AnchorLink href={LinksConfig.Home} onClick={() => setIsMobileMenuOpen(false)}>
            <div className='clickable cursor-pointer w-[3.188rem] h-[3.188rem]'>
              <img
                src={Section.getImageUrl(settings!.siteLogo)}
                alt='logo'
                className='w-full h-full'
              />
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
