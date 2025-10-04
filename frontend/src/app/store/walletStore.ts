import { create } from 'zustand'
import type { Transaction } from '@/app/types/transaction.type'

const useWalletStore = create<{
  isConnected: boolean
  balance: {
    usdt: number
    sol: number
  }
  setBalance: (balance: { usdt: number; sol: number }) => void
  setIsConnected: (isConnected: boolean) => void
  data: { transactions: Transaction[], totalCoinsPurchased: number, totalCoinsReceived: number, totalSpentSOL: number, totalSpentUSDT: number }
  setData: (data: { transactions: Transaction[], totalCoinsPurchased: number, totalCoinsReceived: number, totalSpentSOL: number, totalSpentUSDT: number }) => void
}>((set) => ({
  data: { transactions: [], totalCoinsPurchased: 0, totalCoinsReceived: 0, totalSpentSOL: 0, totalSpentUSDT: 0 },
  isConnected: false,
  balance: {
    usdt: 0,
    sol: 0,
  },
  setData: (data: { transactions: Transaction[], totalCoinsPurchased: number, totalCoinsReceived: number, totalSpentSOL: number, totalSpentUSDT: number }) => set({ data }),
  setBalance: (balance: { usdt: number; sol: number }) => set({ balance }),
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
}))

export { useWalletStore }
