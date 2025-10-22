import { useState } from 'react'
import type { Transaction } from '@/app/types/transaction.type'

const useDetailsModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleDetailsClick = (transaction: Transaction) => {
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
