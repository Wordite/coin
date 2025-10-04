import React from 'react'
import { Toast } from './Toast'
import { useToastContext } from './ToastProvider'

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </>
  )
}

export { ToastContainer } 