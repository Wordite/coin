import { useEffect, useState, useRef, ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-[20rem] max-md:w-[85%]',
  md: 'w-[28rem] max-md:w-[90%]',
  lg: 'w-[40rem] max-md:w-[95%]'
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
  size = 'md'
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isVisible) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`fixed left-1/2 top-1/2 z-[101] bg-gray-transparent-70 rounded-xl border-1 border-stroke-light p-[1.5rem] max-md:p-[1.25rem] transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100'
            : 'opacity-0 -translate-x-1/2 -translate-y-1/2 scale-90'
        } ${sizeClasses[size]} ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-[1rem]">
            {title && (
              <h2 className="font-semibold text-[1.4rem] max-md:text-[1.8rem] text-white">{title}</h2>
            )}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="w-[1.5rem] h-[1.5rem] max-md:w-[2rem] max-md:h-[2rem] text-white-transparent-75 hover:text-white hover:scale-110 transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  )
}

export default Modal
