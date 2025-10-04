import { Link } from 'react-router'
import { useState } from 'react'
import { useHeaderStore } from '@/app/store/headerStore'
import { useAppKitAccount } from '@reown/appkit/react'

const Profile = () => {
  const { address } = useAppKitAccount()
  const publicKey = address || ''
  const [isHovered, setIsHovered] = useState(false)
  const { setIsMobileMenuOpen, isMobileMenuOpen } = useHeaderStore()

  const formatPublicKey = (key: string) => {
    if (!key) return ''
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  return (
    <div className='relative max-md:mt-auto max-md:w-full'>
      <Link to='/profile' onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
        <div
          className='flex items-center gap-[0.75rem] px-[1rem] py-[0.5rem] max-md:py-[1rem] rounded-md bg-gray-transparent-50 border-1 border-stroke-light hover:bg-gray-transparent-70 transition-all duration-200 clickable'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className='flex flex-col items-start'>
            <span className='text-white text-[0.875rem] font-medium max-md:text-[1.4rem]'>
              {formatPublicKey(publicKey)}
            </span>
            <span className='text-white-transparent-50 text-[0.75rem] max-md:text-[1.2rem]'>Connected</span>
          </div>

          <div
            className={`transition-transform duration-200 max-md:ml-auto ${
              isHovered ? 'transform translate-x-1' : ''
            }`}
          >
            <svg
              viewBox='0 0 12 12'
              fill='none'
              className='text-white-transparent-50 w-[1rem] h-[1rem] max-md:w-[2rem] max-md:h-[2rem]'
            >
              <path
                d='M4.5 3L7.5 6L4.5 9'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}

export { Profile }
