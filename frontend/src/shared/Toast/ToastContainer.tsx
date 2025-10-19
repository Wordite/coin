import React, { useState, useEffect } from 'react'
import { Toast } from './Toast'
import { useToastContext } from './ToastProvider'

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext()
  const [visibleToasts, setVisibleToasts] = useState<Set<string>>(new Set())

  // Добавляем новые toast в видимые
  useEffect(() => {
    setVisibleToasts(prev => {
      const newVisibleToasts = new Set(prev)
      toasts.forEach(toast => {
        if (!prev.has(toast.id)) {
          newVisibleToasts.add(toast.id)
        }
      })
      return newVisibleToasts
    })
  }, [toasts])

  const handleClose = (id: string) => {
    // Удаляем из видимых сразу, но оставляем в DOM для анимации
    setVisibleToasts(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    
    // Удаляем из массива после анимации
    setTimeout(() => {
      removeToast(id)
    }, 500) // Длительность анимации
  }

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={visibleToasts.has(toast.id)}
          onClose={() => handleClose(toast.id)}
          duration={toast.duration}
        />
      ))}
    </>
  )
}

export { ToastContainer } 