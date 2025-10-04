import { create } from 'zustand'

interface HeaderStore {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isMobileMenuOpen: boolean) => void
}

const useHeaderStore = create<HeaderStore>((set) => ({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (isMobileMenuOpen: boolean) => set({ isMobileMenuOpen }),
}))



export { useHeaderStore }
