export interface Transaction {
  id: string
  type: 'SOL' | 'USDT'
  amount: number
  rate: number
  coinsPurchased: number
  timestamp: string
  txHash?: string
  isReceived: boolean
  isSuccessful: boolean
}

export interface TransactionStats {
  totalSpentSOL: number
  totalSpentUSDT: number
  totalCoinsPurchased: number
  totalCoinsReceived: number
  totalPendingTokens: number
}

export interface UserWithTransactions {
  id: string
  email: string | null
  walletAddress: string | null
  role: string
  createdAt: string
  updatedAt: string
  transactions: Transaction[]
  totalSpentSOL: number
  totalSpentUSDT: number
  totalCoinsPurchased: number
  totalCoinsReceived: number
  totalPendingTokens: number
}
