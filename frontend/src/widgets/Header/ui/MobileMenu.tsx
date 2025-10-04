import { useIsMobile } from '@/hooks/useIsMobile'
import { useHeaderStore } from '@/app/store/headerStore'
import { useEffect, useState } from 'react'
import { AnchorLink } from '@/shared/AnchorLink'
import Button from '@/shared/Button'
import { Profile } from './Profile'
import { useSectionData } from '@/hooks'
import { HomeLinks } from '@/config/homeLinks'
import { useAppKit } from '@reown/appkit/react'
import { useToast } from '@/shared/Toast'
import { useWalletStore } from '@/app/store/walletStore'

const MobileMenu = () => {
  const isMobile = useIsMobile()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useHeaderStore()
  const [isMounted, setIsMounted] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const { open } = useAppKit()
  const { isConnected } = useWalletStore()
  const {
    data: { links: headerLinks },
    isLoading: isHeaderLinksLoading,
    error: headerLinksError,
  } = useSectionData('HeaderLinks')

  const [isConnecting, setIsConnecting] = useState(false)
  const { showError} = useToast()

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

  if (isHeaderLinksLoading || headerLinksError) return null
  // const { disableScroll, enableScroll } = useDisableScroll()

  const toggleDropdown = (linkLabel: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(linkLabel)) {
        newSet.delete(linkLabel)
      } else {
        newSet.add(linkLabel)
      }
      return newSet
    })
  }

  useEffect(() => {
    if (isMobileMenuOpen && !isMounted) setIsMounted(true)

    if (!isMobileMenuOpen) {
      setOpenDropdowns(new Set())
    }

    // if (isMobileMenuOpen) {
    //   disableScroll()
    // } else {
    //   enableScroll()
    // }
    // TODO: delete or change
  }, [isMobileMenuOpen])

  if (!isMobile) return null

  return (
    <div
      className={`mobile-menu duration-300 hidden opacity-0 transform-gpu fixed top-[7.25rem] p-[2rem] overflow-hidden border-1 border-stroke-dark left-1/2 rounded-md -translate-x-1/2 w-[90%] h-[calc(100dvh-8.25rem)] items-center z-40 bg-gray-transparent-70 backdrop-blur-md ${
        isMobileMenuOpen ? 'show' : `hide ${!isMounted ? 'no-animation' : ''}`
      }`}
    >
      <nav className='w-full mt-[0.25rem] mb-[5rem]'>
        <ul className='flex flex-col items-center w-full h-full gap-[4rem] text-[1.125rem]'>
          {[HomeLinks, ...headerLinks].map((link, index) => (
            <li key={index} className='w-full'>
              {link.nestedLinks ? (
                <div className='w-full'>
                  <button
                    className='w-full text-[2rem] border-b-[0.063rem] pb-[.5rem] border-stroke-dark font-medium duration-300 flex items-center justify-between'
                    onClick={() => toggleDropdown(link.label || link.textField1)}
                  >
                    <span>{link.label || link.textField1}</span>
                    <svg
                      className={`w-8 h-8 transition-transform duration-300 ${
                        openDropdowns.has(link.label || link.textField1) ? 'rotate-180' : ''
                      }`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </button>
                  
                  {/* nested links */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openDropdowns.has(link.label || link.textField1) 
                        ? 'max-h-96 opacity-100 mt-4' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className='flex flex-col gap-[1.5rem]'>
                      {link.nestedLinks.map((nestedLink: { label: string; href: string }, index: number) => (
                        <li key={index}>
                          <AnchorLink
                            className='w-full text-[1.8rem] pl-[2rem] pb-[.5rem] font-medium duration-300 opacity-80 hover:opacity-100'
                            key={index}
                            href={nestedLink.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {nestedLink.label}
                          </AnchorLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <AnchorLink
                  className='w-full block text-[2rem] border-b-[0.063rem] pb-[.5rem] border-stroke-dark font-medium duration-300'
                  href={link.href || link.textField2}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label || link.textField1}
                </AnchorLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

          {isConnected ? (
            <Profile />
          ) : (
            <Button 
              color='purple' 
              className='w-full mt-auto max-md:h-[4.6rem]' 
              onClick={handleConnectWallet}
              isLoading={isConnecting}
            >
              Connect Wallet
            </Button>
          )}
    </div>
  )
}

export { MobileMenu }
