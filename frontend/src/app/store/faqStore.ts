import { create } from 'zustand'

interface FAQStore {
  openQuestions: Set<number>
  toggleQuestion: (index: number) => void
  closeAll: () => void
}

export const useFAQStore = create<FAQStore>((set, get) => ({
  openQuestions: new Set(),
  toggleQuestion: (index: number) => {
    const { openQuestions } = get()
    const newOpenQuestions = new Set(openQuestions)
    
    if (newOpenQuestions.has(index)) {
      newOpenQuestions.delete(index)
    } else {
      newOpenQuestions.clear()
      newOpenQuestions.add(index)
    }
    
    set({ openQuestions: newOpenQuestions })
  },
  closeAll: () => set({ openQuestions: new Set() }),
})) 