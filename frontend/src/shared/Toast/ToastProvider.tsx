import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useToast } from './useToast'
import type { ToastMessage } from './useToast'
import { ToastContainer } from './ToastContainer'

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastMethods = useToast()

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
} 