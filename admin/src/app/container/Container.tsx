import { Aside } from '@/widgets/Aside'
import { HeroUIProvider, useDisclosure } from '@heroui/react'
import { Outlet, useHref, useNavigate } from 'react-router'
import { NavigatorInitializer } from '@/services/navigate/NavigationInitializer'
import { LocationTracker } from '@/services/location/LocationTracker'
import { AuthInitializer } from '@/services/auth/AuthInitializer'
import { RootWalletNotInitializedModal } from '@/pages/Settings/components'
import { useAuthStore } from '@/app/store/authStore'
import { useEffect, useRef } from 'react'

const Container = () => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isRootWalletInitialized } = useAuthStore()
  const hasShownRootWalletModal = useRef(false)

  useEffect(() => {
    const sessionStatus = sessionStorage.getItem('isRootWalletInitialized')
    const hasSeenModal = sessionStorage.getItem('hasSeenRootWalletModal') === 'true'


    // Показываем модал если:
    // 1. Модал еще не показывался в этой сессии
    // 2. И (статус в sessionStorage = 'false' ИЛИ isRootWalletInitialized = false)
    if (!hasSeenModal && (sessionStatus === 'false' || !isRootWalletInitialized)) {
      onOpen()
      sessionStorage.setItem('hasSeenRootWalletModal', 'true')
      hasShownRootWalletModal.current = true
    }
  }, [isRootWalletInitialized, onOpen])

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <NavigatorInitializer />
      <AuthInitializer />
      <LocationTracker />
      <div className='flex relative dark text-foreground bg-background min-h-screen max-h-screen overflow-hidden'>
        <Aside />
        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
      
      {/* Root Wallet Not Initialized Modal */}
      <RootWalletNotInitializedModal 
        isOpen={isOpen} 
        onClose={onClose} 
      />
    </HeroUIProvider>
  )
}

export { Container }
