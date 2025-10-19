import React, { useEffect, useState, useCallback } from 'react'
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
  const [shouldShow, setShouldShow] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (isClosing) return // Предотвращаем множественные вызовы
    setIsClosing(true)
    setTimeout(() => {
      setShouldShow(false)
      onClose()
    }, 500)
  }, [isClosing, onClose])

  useEffect(() => {
    if (isVisible && !shouldShow) {
      // Только при первом появлении
      setShouldShow(true)
      setIsClosing(false)
    }
  }, [isVisible, shouldShow])

  useEffect(() => {
    if (shouldShow && !isClosing) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [shouldShow, isClosing, duration, handleClose])

  useEffect(() => {
    if (!isVisible && shouldShow && !isClosing) {
      handleClose()
    }
  }, [isVisible, shouldShow, isClosing, handleClose])

  if (!shouldShow) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 text-green-100 border-green-400/30'
      case 'error':
        return 'bg-red-500/20 text-red-100 border-red-400/30'
      case 'info':
        return 'bg-[var(--color-purple-600)]/20 text-purple-100 border-purple-400/30'
      default:
        return 'bg-gray-500/20 text-gray-100 border-gray-400/30'
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
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ease-out',
      'max-md:bottom-[2dvh] max-md:w-[80%]',
      !isClosing 
        ? 'translate-y-0 opacity-100 scale-100 rotate-0' 
        : 'translate-y-full opacity-0 scale-95 rotate-12',
      'max-md:translate-y-0 max-md:rotate-0'
    )}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 max-md:py-[1.5rem] rounded-xl shadow-2xl backdrop-blur-md border',
        'transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-3xl',
        'max-md:px-4 max-md:py-3 max-md:gap-3 max-md:w-full max-md:justify-start',
        'bg-gray-transparent-70',
        styles['animate-toast-enter'],
        styles[`toast-${type}`],
        getToastStyles()
      )}>
        <div className={cn('w-5 h-5 max-md:w-8 max-md:h-8', styles['animate-icon-enter'])}>
          {getIcon()}
        </div>
        <span className={cn('font-medium text-sm max-md:text-[1.6rem] max-md:flex-1', styles['animate-text-enter'])}>{message}</span>
      </div>
    </div>
  )
}

export { Toast } 