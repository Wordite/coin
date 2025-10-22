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
      .filter((tx) => tx.isReceived && tx.coinsPurchased > 0)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)
  }

  /**
   * Calculate total pending tokens (successful but not received)
   */
  calculatePendingTokens(transactions: Transaction[]): number {
    return transactions
      .filter((tx) => tx.isSuccessful && !tx.isReceived)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)
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
}
