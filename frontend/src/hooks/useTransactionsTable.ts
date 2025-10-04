import { useState, useMemo } from 'react'

export interface TransactionItem {
  time: string
  amount: string
  receive: string
  price: string
  stage: string
  isPresale?: boolean
  isClaimed?: boolean
  txHash?: string
  blockTime?: string
  status?: 'completed' | 'pending' | 'failed'
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
    return orders.slice((page - 1) * pageSize, page * pageSize)
  }, [orders, page, pageSize])

  return {
    page,
    setPage,
    totalPages,
    currentItems,
  }
}