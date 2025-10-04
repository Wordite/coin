import React, { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/classNames'
import styles from './Toast.module.scss'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 500)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-[var(--color-green)] text-black'
      case 'error':
        return 'bg-red-500 text-white'
      case 'info':
        return 'bg-[var(--color-purple-600)] text-white'
      default:
        return 'bg-[var(--color-gray-200)] text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-full  h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-full  h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-full  h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn(
      'fixed top-6 right-6 z-50 transform transition-all duration-700 ease-out',
      'max-md:top-auto max-md:bottom-[2dvh] max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto max-md:w-[80%]',
      isVisible 
        ? 'translate-x-0 opacity-100 scale-100 rotate-0' 
        : 'translate-x-full opacity-0 scale-95 rotate-12',
      'max-md:translate-y-0 max-md:rotate-0'
    )}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 max-md:py-[1.5rem] rounded-xl shadow-2xl backdrop-blur-3xl border border-[var(--color-stroke-light)]',
        'transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-3xl',
        'max-md:px-4 max-md:py-3 max-md:gap-3 max-md:w-full max-md:justify-start',
        styles['animate-toast-enter'],
        styles[`toast-${type}`],
        getToastStyles()
      )}>
        <div className={cn('w-5 h-5 max-md:w-8 max-md:h-8', styles['animate-icon-enter'])}>
          {getIcon()}
        </div>
        <span className={cn('font-medium text-sm max-md:text-[1.6rem] max-md:flex-1', styles['animate-text-enter'])}>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full hover:bg-black/20 transition-all duration-300 ease-out hover:scale-110 hover:rotate-90 max-md:hidden"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export { Toast } 