import { create } from 'zustand'
import { Modals } from '@/constants/modals'

interface ModalState {
  modals: Record<string, boolean>
  openModal: (name: keyof typeof Modals) => void
  closeModal: (name: keyof typeof Modals) => void
  toggleModal: (name: keyof typeof Modals) => void
  isModalOpen: (name: keyof typeof Modals) => boolean
  closeAllModals: () => void
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: {},
  
  openModal: (name: keyof typeof Modals) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: true
      }
    }))
  },
  
  closeModal: (name: keyof typeof Modals) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: false
      }
    }))
  },
  
  toggleModal: (name: keyof typeof Modals) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: !state.modals[name]
      }
    }))
  },
  
  isModalOpen: (name: keyof typeof Modals) => {
    return get().modals[name] || false
  },
  
  closeAllModals: () => {
    set((state) => {
      const closedModals: Record<keyof typeof Modals, boolean> = {}
      Object.keys(state.modals).forEach(key => {
        closedModals[key] = false
      })
      return { modals: closedModals }
    })
  }
}))
