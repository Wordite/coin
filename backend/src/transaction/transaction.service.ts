import { Injectable, Logger } from '@nestjs/common'
import { Transaction, TransactionStats } from './transaction.types'

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name)

  /**
   * Safely parse transactions from JSON string or array to Transaction[]
   */
  parseTransactions(data: any): Transaction[] {
    try {
      if (!data) return []
      
      if (typeof data === 'string') {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : []
      }
      
      if (Array.isArray(data)) {
        return data
      }
      
      return []
    } catch (error) {
      this.logger.warn('Failed to parse transactions:', error)
      return []
    }
  }

  /**
   * Add a new transaction to existing transactions list
   */
  addTransaction(existingTransactions: any, newTransaction: Transaction): Transaction[] {
    const transactions = this.parseTransactions(existingTransactions)
    return [...transactions, newTransaction]
  }

  /**
   * Calculate total coins purchased from all transactions
   */
  calculateTotalCoins(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.coinsPurchased, 0)
  }

  /**
   * Calculate total amount spent by currency type
   */
  calculateSpentByType(transactions: Transaction[], type: 'SOL' | 'USDT'): number {
    return transactions
      .filter((tx) => tx.type === type)
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  /**
   * Calculate total coins received (where isReceived is true)
   */
  calculateTotalReceived(transactions: Transaction[]): number {
    return transactions
      .filter((tx) => tx.isSuccessful && tx.isReceived)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)
  }

  /**
   * Calculate total pending tokens with temporal ordering.
   * Rules:
   *  - Pending comes from successful purchases that are not received yet (positive coins only).
   *  - Negative ADMIN_ADJUSTMENT (received) may reduce currently pending amount at the time it occurs,
   *    but cannot push pending below zero. This prevents old large negative adjustments from wiping out
   *    new pending purchases made later.
   */
  calculatePendingTokens(transactions: Transaction[]): number {
    const txs = [...transactions]
      .filter((t) => t && typeof t === 'object')
      .sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime()
        const tb = new Date(b.timestamp || 0).getTime()
        return ta - tb
      })

    let pending = 0
    for (const tx of txs) {
      if (!tx.isSuccessful) continue

      // Add positive, successful, not-received purchases to pending
      if (!tx.isReceived && tx.coinsPurchased > 0) {
        pending += tx.coinsPurchased
        continue
      }

      // Apply negative admin adjustments to reduce current pending only
      if (
        tx.isReceived &&
        tx.txHash === 'ADMIN_ADJUSTMENT' &&
        tx.coinsPurchased < 0
      ) {
        pending = Math.max(0, pending + tx.coinsPurchased)
      }
    }

    return Math.max(0, pending)
  }

  /**
   * Calculate all transaction statistics at once
   */
  calculateStats(transactions: Transaction[]): TransactionStats {
    return {
      totalSpentSOL: this.calculateSpentByType(transactions, 'SOL'),
      totalSpentUSDT: this.calculateSpentByType(transactions, 'USDT'),
      totalCoinsPurchased: this.calculateTotalCoins(transactions),
      totalCoinsReceived: this.calculateTotalReceived(transactions),
      totalPendingTokens: this.calculatePendingTokens(transactions),
    }
  }

  /**
   * Create an admin adjustment transaction
   */
  createAdjustmentTransaction(currentTotal: number, newTotal: number): Transaction {
    const adjustmentAmount = newTotal - currentTotal
    
    return {
      id: `adjustment-${Date.now()}`,
      type: 'SOL', // Default type for adjustments
      amount: 0,
      rate: 0,
      coinsPurchased: adjustmentAmount,
      timestamp: new Date().toISOString(),
      txHash: 'ADMIN_ADJUSTMENT',
      isReceived: adjustmentAmount < 0,
      isSuccessful: true,
    }
  }

  /**
   * Mark pending transactions as received
   */
  markTransactionsAsReceived(transactions: Transaction[]): string {
    const updated = transactions.map(tx =>
      tx.isSuccessful && !tx.isReceived
        ? { ...tx, isReceived: true }
        : tx
    )
    return JSON.stringify(updated)
  }
}
