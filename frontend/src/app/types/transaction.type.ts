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
