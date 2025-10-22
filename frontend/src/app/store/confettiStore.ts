import { create } from 'zustand'

interface ConfettiStore {
  isActive: boolean
  triggerConfetti: () => void
  stopConfetti: () => void
  onComplete: () => void
}

export const useConfettiStore = create<ConfettiStore>((set) => ({
  isActive: false,
  triggerConfetti: () => set({ isActive: true }),
  stopConfetti: () => set({ isActive: false }),
  onComplete: () => set({ isActive: false }),
}))
