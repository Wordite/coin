import { HeroUIProvider } from '@heroui/react'
import { Outlet, useHref, useNavigate } from 'react-router'
import { NavigatorInitializer } from '@/services/navigate/NavigationInitializer'
import { LocationTracker } from '@/services/location/LocationTracker'
import { AuthInitializer } from '@/services/auth/AuthInitializer'

const EmptyContainer = () => {
  const navigate = useNavigate()

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <NavigatorInitializer />
      <AuthInitializer />
      <LocationTracker />
      <div className='flex dark text-foreground bg-background min-h-screen'>
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>
    </HeroUIProvider>
  )
}

export { EmptyContainer }
