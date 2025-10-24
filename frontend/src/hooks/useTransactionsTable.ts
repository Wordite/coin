import { useState, useMemo } from 'react'

export interface TransactionItem {
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

interface UseTransactionsTableProps {
  orders: TransactionItem[]
  pageSize?: number
}

export const useTransactionsTable = ({ orders, pageSize = 10 }: UseTransactionsTableProps) => {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(orders.length / pageSize))
  }, [orders.length, pageSize])

  const currentItems = useMemo(() => {
    // Sort by timestamp descending (newest first), then reverse to show newest at top
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return sortedOrders.slice((page - 1) * pageSize, page * pageSize)
  }, [orders, page, pageSize])

  return {
    page,
    setPage,
    totalPages,
    currentItems,
  }
}