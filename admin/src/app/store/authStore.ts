import { create } from 'zustand'

interface AuthStore {
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  isAuthFromSent: boolean
  setIsAuthFromSent: (isAuthFromSent: boolean) => void
  isRootWalletInitialized: boolean
  setIsRootWalletInitialized: (isInitialized: boolean) => void
}

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => {
    console.log('11111111111111 setIsAuthenticated: isAuthenticated =', isAuthenticated)
    set({ isAuthenticated })
  },
  isAuthFromSent: false,
  setIsAuthFromSent: (isAuthFromSent) => set({ isAuthFromSent }),
  isRootWalletInitialized: true,
  setIsRootWalletInitialized: (isRootWalletInitialized) => set({ isRootWalletInitialized }),
}))

export { useAuthStore }
