import { useEffect, useState, useRef, ReactNode } from 'react'
import CrossIcon from '@/assets/icons/cross.svg'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm: 'w-[25rem] h-[20rem]',
  md: 'w-[31.625rem] h-[35rem]',
  lg: 'w-[40rem] h-[45rem]',
  xl: 'w-[50rem] h-[55rem]',
  full: 'w-[90%] h-[90dvh]'
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  size = 'md'
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      
      setTimeout(() => {
        document.body.querySelector('.' + styles.modalOverlay)?.classList.add(styles.open)
        document.body.querySelector('.' + styles.modalContent)?.classList.add(styles.open)
      }, 10)
    } else {
      document.body.querySelector('.' + styles.modalOverlay)?.classList.remove(styles.open)
      document.body.querySelector('.' + styles.modalContent)?.classList.remove(styles.open)
      
      setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (modalRef.current && modalRef.current.contains(e.target as Node)) {
        e.stopPropagation()
        if (modalRef.current.scrollTop !== undefined) {
          modalRef.current.scrollTop += e.deltaY
        }
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isVisible) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  return (
    <>
      <div
        className={`${styles.modalOverlay} fixed left-0 top-0 w-full h-full bg-black/50 z-[29000] backdrop-blur-md ${overlayClassName}`}
        onClick={handleOverlayClick}
      />
      <div
        ref={modalRef}
        className={`${styles.modalContent} text-[1.25rem] p-[1.563rem] fixed left-1/2 top-1/2 overflow-hidden z-[30000] bg-gray-transparent-70 rounded-xxl border-1 border-stroke-light max-md:w-[90%] max-md:h-[90dvh] max-md:p-[1.5rem] max-md:text-[1.125rem] ${sizeClasses[size]} ${contentClassName} ${className}`}
      >
        {(title || showCloseButton) && (
          <div className='flex justify-between items-center max-md:mb-2'>
            {title && (
              <p className='font-semibold max-md:text-[2rem] max-md:h-[3rem]'>{title}</p>
            )}
            {showCloseButton && (
              <div 
                className='cursor-pointer w-[1.25rem] h-[1.25rem] max-md:w-[2rem] max-md:h-[2rem] hover:scale-110 transition-all duration-300 [&>path]:fill-white'
                onClick={onClose}
              >
                <CrossIcon className='w-full h-full' />
              </div>
            )}
          </div>
        )}
        
        <div className={title || showCloseButton ? 'mt-6 max-md:mt-4' : ''}>
          {children}
        </div>
      </div>
    </>
  )
}
