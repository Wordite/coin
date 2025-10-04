import { create } from 'zustand'

interface WalletModalStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useWalletModalStore = create<WalletModalStore>((set) => ({
  isOpen: false,
  isLoading: false,
  setIsOpen: (isOpen: boolean) => {
    set({ isOpen })
  },
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading })
  },
}))

useWalletModalStore.subscribe((state, prevState) => {
  if (!state.isOpen) {
    if (prevState.isLoading) {
      useWalletModalStore.setState({ isLoading: false })
    }
  }
})
