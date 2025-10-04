import { useState } from 'react'

interface TransactionItem {
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

const useDetailsModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null)

  const handleDetailsClick = (transaction: TransactionItem) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedTransaction(null)
    }, 300)
  }
  
  return {
    handleDetailsClick,
    handleCloseModal,
    isModalOpen,
    selectedTransaction,
  }
}

export { useDetailsModal }
