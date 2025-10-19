import { useCallback } from 'react'
import { useModalStore } from '@/app/store/modalStore'

interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useModal = (modalName: string): UseModalReturn => {
  const { modals, openModal, closeModal, toggleModal } = useModalStore()
  
  const isOpen = modals[modalName] || false

  const open = useCallback(() => {
    openModal(modalName)
  }, [modalName, openModal])

  const close = useCallback(() => {
    closeModal(modalName)
  }, [modalName, closeModal])

  const toggle = useCallback(() => {
    toggleModal(modalName)
  }, [modalName, toggleModal])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}
