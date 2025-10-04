import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Spinner,
} from '@heroui/react'
import {
  ArrowRightOnRectangleIcon,
  PhotoIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { Link as RouterLink } from 'react-router'
import { Auth } from '@/services/auth'
import { useUser } from '@/hooks/useUser'
import { settingsApi } from '@/services/settingsApi'
import { useQuery } from '@tanstack/react-query'

const Aside = () => {
  const { data: user, isLoading } = useUser()
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    retry: false,
  })

  const getUserDisplayName = () => {
    if (!user) return 'Admin User'
    return user.email || 'Admin User'
  }

  const getUserRole = () => {
    if (!user) return 'Administrator'
    return user.role || 'Administrator'
  }

  const getUserInitials = () => {
    if (!user?.email) return 'Ad'
    const email = user.email
    const parts = email.split('@')
    if (parts.length > 0) {
      const name = parts[0]
      if (name.length >= 2) {
        return name.substring(0, 2).toUpperCase()
      }
      return name.charAt(0).toUpperCase()
    }
    return 'Ad'
  }

  const getSiteLogo = () => {
    if (settings?.siteLogo && settings.siteLogo.trim()) {
      if (settings.siteLogo.startsWith('/uploads')) {
        // Remove /api from URL if present and add base URL
        const cleanPath = settings.siteLogo.replace('/api', '')
        const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace('/api', '')
        return `${baseUrl}${cleanPath}`
      }
      return settings.siteLogo
    }
    return null
  }

  const getSiteName = () => {
    if (settings?.siteName && settings.siteName.trim()) {
      return settings.siteName
    }
    return 'Admin Panel'
  }

  return (
    <aside className='top-0 left-0 w-[15rem] h-screen bg-background border-r border-divider flex flex-col'>
      {/* Logo Section */}
      <div className='p-4 border-b border-divider'>
        <div className='flex items-center gap-2'>
          {settingsLoading ? (
            <div className='w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center'>
              <Spinner size="sm" />
            </div>
          ) : getSiteLogo() ? (
            <img 
              src={getSiteLogo() || ''} 
              alt="Site Logo" 
              className='w-8 h-8 rounded-lg object-cover'
            />
          ) : (
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>A</span>
            </div>
          )}
          <div className='font-bold text-inherit'>{getSiteName()}</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        <div className='text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3'>
          Navigation
        </div>

        {/* Presale Link */}
        <RouterLink
          to='/presale'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <CurrencyDollarIcon className='w-4 h-4' />
          Presale
        </RouterLink>

        {/* Media Library Link */}
        <RouterLink
          to='/media-library'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <PhotoIcon className='w-4 h-4' />
          Media Library
        </RouterLink>

        {/* Section Types Link */}
        <RouterLink
          to='/section-types'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <Squares2X2Icon className='w-4 h-4' />
          Section Types
        </RouterLink>

        {/* Contents Link */}
        <RouterLink
          to='/contents'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <DocumentTextIcon className='w-4 h-4' />
          Contents
        </RouterLink>

        {/* Settings Link */}
        <RouterLink
          to='/settings'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <AdjustmentsHorizontalIcon className='w-4 h-4' />
          Settings
        </RouterLink>

              {/* Users Link */}
              <RouterLink
                to='/users'
                className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
              >
                <UsersIcon className='w-4 h-4' />
                Users
              </RouterLink>

              {/* Contacts Link */}
              <RouterLink
                to='/contacts'
                className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
              >
                <EnvelopeIcon className='w-4 h-4' />
                Contacts
              </RouterLink>

              {/* Documentation Link */}
        <RouterLink
          to='/documentation/content'
          className='w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors'
        >
          <BookOpenIcon className='w-4 h-4' />
          Documentation
        </RouterLink>


      </nav>

      {/* Admin Profile Section */}
      <div className='p-4 border-t border-divider'>
        <Dropdown
          placement='top-end'
          className='dark text-foreground bg-background overflow-hidden border-1 border-divider'
        >
          <DropdownTrigger>
            <Button
              variant='light'
              className='w-full justify-start gap-3 px-3 py-2 h-auto min-h-12'
              isDisabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <Avatar name={getUserInitials()} size='sm' className='flex-shrink-0' />
              )}
              <div className='flex flex-col items-start text-left'>
                <span className='text-sm font-medium text-foreground'>
                  {isLoading ? 'Loading...' : getUserDisplayName()}
                </span>
                <span className='text-xs text-foreground/60'>
                  {isLoading ? 'Loading...' : getUserRole()}
                </span>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className='dark text-foreground bg-background overflow-hidden'
            aria-label='Admin actions'
          >
            {/* TODO: Переход на класс сервис - закомментирован */}
            <DropdownItem
              onClick={() => Auth.logout()}
              key='logout'
              className='text-danger'
              color='danger'
              startContent={<ArrowRightOnRectangleIcon className='w-4 h-4' />}
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </aside>
  )
}

export { Aside }
