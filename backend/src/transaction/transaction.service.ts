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
   * Calculate total pending tokens (successful but not received)
   */
  calculatePendingTokens(transactions: Transaction[]): number {
    // Base pending = sum of successful transactions that are not yet received
    // Additionally, take into account admin adjustments that decrease coins
    // (txHash === 'ADMIN_ADJUSTMENT' and coinsPurchased < 0). Those should
    // immediately reduce the pending amount even if they are marked as received.
    const pendingBase = transactions
      .filter((tx) => tx.isSuccessful && !tx.isReceived)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)

    const negativeAdjustments = transactions
      .filter(
        (tx) =>
          tx.isSuccessful &&
          tx.isReceived &&
          tx.txHash === 'ADMIN_ADJUSTMENT' &&
          tx.coinsPurchased < 0
      )
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)

    // pendingBase is >= 0; negativeAdjustments is <= 0.
    // Ensure pending amount is never negative.
    return Math.max(0, pendingBase + negativeAdjustments)
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
