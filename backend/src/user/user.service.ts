import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Roles } from 'src/auth/constants/roles.constant'
import { User } from '@prisma/client'
import { TokenInvalidationService } from 'src/auth/services/token-invalidation.service'
import { SolanaService } from 'src/solana/solana.service'
import { WalletService } from 'src/wallet/wallet.service'
import { AntiSpamService } from 'src/anti-spam/anti-spam.service'
import { SettingsService } from 'src/settings/settings.service'
import { CoinService } from 'src/coin/coin.service'
import { TransactionService } from 'src/transaction/transaction.service'
import { RedisService } from 'src/redis/redis.service'
import { Request } from 'express'

// ===== INTERFACES FOR USERS MANAGEMENT =====

import { Transaction, UserWithTransactions } from 'src/transaction/transaction.types'

export interface UsersListResponse {
  users: UserWithTransactions[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private tokenInvalidationService: TokenInvalidationService,
    private solanaService: SolanaService,
    private walletService: WalletService,
    private antiSpamService: AntiSpamService,
    private settingsService: SettingsService,
    private coinService: CoinService,
    private transactionService: TransactionService,
    private redis: RedisService
  ) {}

  private readonly logger = new Logger(UserService.name)


  async findById(id: string | number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findByWalletAddress(address: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    })

    return user
  }

  async createUserByWalletAddress(address: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: { walletAddress: address, role: Roles.USER },
    })

    return user
  }

  getStatsByUser(user: User): UserWithTransactions {
    return this.calculateUserStats(user)
  }
    

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return user
  }

  async createUserByEmail(email: string, hashedPassword: string): Promise<User> {
    const role = (await this.isHaveUsers()) ? Roles.USER : Roles.ADMIN

    this.logger.log(`Create user by email: ${email} with role: ${role}`)

    return await this.prisma.user.create({
      data: { email, password: hashedPassword, role },
    })
  }

  private async isHaveUsers(): Promise<boolean> {
    const users = await this.prisma.user.findMany()
    return users.length > 0
  }

  async getUserProfileById(
    id: string
  ): Promise<{ email: string | null; walletAddress: string | null; role: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        walletAddress: true,
        role: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async isEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    return !!user
  }



  async migrateFromAuthorizationRequest(authorizationRequestId: string): Promise<void> {
    const authorizationRequest = await this.prisma.authorizationRequest.findUnique({
      where: { id: authorizationRequestId },
      include: {
        activationLink: true,
      },
    })

    if (!authorizationRequest) throw new NotFoundException('Authorization request not found')
    if (!authorizationRequest.activationLink)
      throw new NotFoundException('Activation link not found')

    const user = await this.createUserByEmail(
      authorizationRequest.email,
      authorizationRequest.password
    )

    await this.prisma.authorizationRequest.delete({
      where: { id: authorizationRequestId },
    })

    const session = await this.prisma.session.findFirst({
      where: {
        activationLink: {
          id: authorizationRequest.activationLink.id!,
        },
      },
    })

    if (session) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          userId: user.id,
          isActivated: true,
        },
      })
    }
  }

  async purchaseCoins(address: string, transaction: any, req: Request): Promise<void> {
    this.logger.log(`[PURCHASE START] Address: ${address}, Signature: ${transaction.signature}`)
    
    const isSoldOut = await this.coinService.isSoldOut()
    if (isSoldOut) {
      this.logger.log(`[PURCHASE ERROR] All coins are sold out, rejecting purchase`)
      throw new BadRequestException('All coins are sold out')
    }
    
    try {
      const txCheck = await this.walletService.checkIsReceived(transaction.signature)
      this.logger.log(`[TX CHECK] Exists: ${txCheck.exists}, Success: ${txCheck.isSuccessful}, Finalized: ${txCheck.isFinalized}`)

      if (!txCheck.exists) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 20, {
            reason: 'invalid_transaction_signature',
            address,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction not found')
      }

      // If transaction failed, add spam points and throw error
      if (!txCheck.isSuccessful) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 30, {
            reason: 'transaction_rejected',
            address,
            signature: transaction.signature,
            error: txCheck.error,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction was rejected')
      }

      // If transaction not finalized, add spam points and throw error
      if (!txCheck.isFinalized) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 15, {
            reason: 'transaction_not_finalized',
            address,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction is not finalized yet')
      }

      // 2. Get transaction data for additional validation using retry logic
      let txData: any = null
      const rpcEndpoints = await this.solanaService.getAllRpcEndpoints()
      
      for (const rpcUrl of rpcEndpoints) {
        try {
          this.logger.log(`[TX DATA] Trying to get transaction data from RPC: ${rpcUrl}`)
          txData = await this.solanaService.getTransactionFromRpc(transaction.signature, rpcUrl)
          if (txData) {
            this.logger.log(`[TX DATA] Transaction data found on RPC: ${rpcUrl}`)
            break
          }
        } catch (error) {
          this.logger.warn(`[TX DATA] Error getting transaction data from RPC ${rpcUrl}:`, error)
          continue
        }
      }
      
      if (!txData) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 10, {
            reason: 'transaction_details_unavailable',
            address,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction details are not available yet. Please try again later')
      }

      // 3. Validate transaction is sent to our wallet
      const rootWalletAddress = await this.walletService.getPublicKey()
      this.logger.log(`[ROOT WALLET] Address: ${rootWalletAddress}`)

      const isSentToOurWallet = txData.meta?.postTokenBalances?.some(
        (balance: any) => balance.owner === rootWalletAddress
      ) || txData.transaction.message.accountKeys.some(
        (key: any) => key.pubkey.toBase58() === rootWalletAddress
      )
      
      if (!isSentToOurWallet) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 25, {
            reason: 'transaction_not_sent_to_our_wallet',
            address,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction is not sent to our wallet')
      }
      
      // 4. Validate sender address
      const senderAddress = txData.transaction.message.accountKeys[0]?.pubkey.toBase58()
      if (senderAddress !== address) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 30, {
            reason: 'transaction_sender_mismatch',
            address,
            actualSender: senderAddress,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction sender does not match provided address')
      }

      // 5. Get settings and rates
      const settings = await this.settingsService.getSettings()
      const presaleSettings = await this.coinService.getPresaleSettings()
      const rate = transaction.type === 'SOL' 
        ? (settings?.solToCoinRate || 0) 
        : (settings?.usdtToCoinRate || 0)
      
      this.logger.log(`[RATE] Type: ${transaction.type}, Rate: ${rate}`)

      // 6. Calculate coins to purchase first
      const purchaseAmount = transaction.amount || 0
      const coinsToPurchase = Math.floor(purchaseAmount * rate)
      this.logger.log(`[CALC] SOL Amount: ${purchaseAmount}, Coins: ${coinsToPurchase}, Rate: ${rate}`)
      
      // 7. Check min/max amounts (in coins)
      if (coinsToPurchase < presaleSettings.minBuyAmount) {
        throw new BadRequestException(`Minimum purchase amount is ${presaleSettings.minBuyAmount} coins (${presaleSettings.minBuyAmount / rate} SOL)`)
      }
      
      let actualCoinsToPurchase = coinsToPurchase
      if (coinsToPurchase > presaleSettings.maxBuyAmount) {
        actualCoinsToPurchase = presaleSettings.maxBuyAmount
        this.logger.warn(`[AMOUNT CAP] Requested: ${coinsToPurchase} coins, Capped to: ${actualCoinsToPurchase}`)
      }
      this.logger.log(`[CALC] Amount: ${purchaseAmount}, Coins: ${actualCoinsToPurchase}`)

      // 8. Check available amount and cap to avoid overselling
      const availableAmount = await this.coinService.getCurrentAvailableAmount()
      this.logger.log(`[AVAILABLE CHECK] Available: ${availableAmount}, Requested: ${actualCoinsToPurchase}`)
      if (availableAmount <= 0) {
        this.logger.warn('[AVAILABLE CHECK] No coins available to purchase')
        throw new BadRequestException('Not enough coins available')
      }
      if (actualCoinsToPurchase > availableAmount) {
        this.logger.warn(`[AMOUNT CAP - AVAILABLE] Requested ${actualCoinsToPurchase} exceeds available ${availableAmount}. Capping to available.`)
        actualCoinsToPurchase = availableAmount
      }

      // 9. Find user
      const user = await this.prisma.user.findFirst({
        where: { walletAddress: address }
      })
      
      if (!user) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 15, {
            reason: 'user_not_found_for_purchase',
            address,
            signature: transaction.signature,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new NotFoundException('User not found')
      }

      // 10. Create transaction record
      const newTransaction: Transaction = {
        id: transaction.signature,
        type: transaction.type || 'SOL',
        amount: purchaseAmount,
        rate: rate,
        coinsPurchased: actualCoinsToPurchase,
        timestamp: new Date().toISOString(),
        txHash: transaction.signature,
        isReceived: false,
        isSuccessful: txCheck.isSuccessful && txCheck.isFinalized
      }

      this.logger.log(`[NEW TRANSACTION] ${JSON.stringify(newTransaction)}`)

      // 11. Save transaction to user using TransactionService
      const currentTransactions = this.transactionService.parseTransactions(user.transactions)
      const updatedTransactions = this.transactionService.addTransaction(user.transactions, newTransaction)
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          transactions: JSON.stringify(updatedTransactions)
        }
      })

      // 12. If successful, update soldAmount
      if (txCheck.isSuccessful && txCheck.isFinalized) {
        await this.coinService.updateSoldAmount(actualCoinsToPurchase)
        this.logger.log(`[SOLD UPDATED] Added ${actualCoinsToPurchase} to soldAmount`)
      }
      
      this.logger.log(`[PURCHASE COMPLETE] User: ${address}, Coins: ${actualCoinsToPurchase}`)
      
    } catch (error) {
      this.logger.error(`[PURCHASE ERROR] Address: ${address}, Error: ${error.message}`)
      
      if (req && error instanceof BadRequestException) {
        const key = req.ip || 'unknown'
        await this.antiSpamService.addPoints(key, 2, {
          reason: 'purchase_validation_error',
          address,
          signature: transaction?.signature,
          error: error.message,
          ip: req.ip,
          ua: req.get?.('user-agent'),
          timestamp: Date.now()
        })
      }
      
      throw error
    }
  }

  // ===== NEW METHODS FOR USERS MANAGEMENT =====

  async getUsers(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    search?: string,
    filterType?: 'all' | 'pending' | 'issued'
  ): Promise<UsersListResponse> {
    const skip = (page - 1) * limit

    // Build orderBy object
    let orderBy: any = { createdAt: 'desc' }

    switch (sortBy) {
      case 'email':
        orderBy = { email: sortOrder }
        break
      case 'walletAddress':
        orderBy = { walletAddress: sortOrder }
        break
      case 'role':
        orderBy = { role: sortOrder }
        break
      case 'createdAt':
        orderBy = { createdAt: sortOrder }
        break
      case 'updatedAt':
        orderBy = { updatedAt: sortOrder }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Build where clause for search
    let whereClause: any = {}
    if (search && search.trim()) {
      whereClause = {
        OR: [
          { email: { contains: search.trim(), mode: 'insensitive' } },
          { walletAddress: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }
    }

    // For filtering, we need to get all users first, then apply pagination
    let allUsers: any[] = []
    let total = 0

    if (filterType && filterType !== 'all') {
      // Get all users for filtering
      allUsers = await this.prisma.user.findMany({
        orderBy,
        where: whereClause,
        select: {
          id: true,
          email: true,
          walletAddress: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          transactions: true,
        },
      })

      // Calculate stats and apply filtering
      let usersWithCalculations = allUsers.map((user) => this.calculateUserStats(user))
      
      usersWithCalculations = usersWithCalculations.filter(user => {
        switch (filterType) {
          case 'pending':
            return user.totalCoinsReceived < user.totalCoinsPurchased
          case 'issued':
            return user.totalCoinsReceived >= user.totalCoinsPurchased
          default:
            return true
        }
      })

      // Apply pagination to filtered results
      total = usersWithCalculations.length
      const paginatedUsers = usersWithCalculations.slice(skip, skip + limit)

      return {
        users: paginatedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } else {
      // No filtering - use normal pagination
      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          orderBy,
          where: whereClause,
          select: {
            id: true,
            email: true,
            walletAddress: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            transactions: true,
          },
        }),
        this.prisma.user.count({ where: whereClause }),
      ])

      const usersWithCalculations = users.map((user) => this.calculateUserStats(user))

      return {
        users: usersWithCalculations,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    }
  }

  async getUserById(id: string): Promise<UserWithTransactions | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        transactions: true,
      },
    })

    if (!user) return null

    return this.calculateUserStats(user)
  }

  async updateUserCoins(id: string, newCoinsAmount: number): Promise<UserWithTransactions> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { transactions: true },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const transactions = this.transactionService.parseTransactions(user.transactions)

    // Calculate current total coins
    const currentTotalCoins = this.transactionService.calculateTotalCoins(transactions)
    console.log('currentTotalCoins', currentTotalCoins)

    // Calculate the difference to update soldAmount
    const difference = newCoinsAmount - currentTotalCoins
    console.log('difference', difference)

    // Update soldAmount in coin settings if there's a difference
    if (difference !== 0) {
      await this.coinService.updateSoldAmount(difference)
      this.logger.log(`[UPDATE USER COINS] Updated soldAmount by ${difference} for user ${id}`)
    }

    // Create adjustment transaction
    const adjustmentTransaction = this.transactionService.createAdjustmentTransaction(currentTotalCoins, newCoinsAmount)
    console.log('adjustmentAmount', adjustmentTransaction.coinsPurchased)

    const updatedTransactions = this.transactionService.addTransaction(user.transactions, adjustmentTransaction)

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { transactions: updatedTransactions as any },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        transactions: true,
      },
    })

    return this.calculateUserStats(updatedUser)
  }

  private calculateUserStats(user: any): UserWithTransactions {
    const transactions = this.transactionService.parseTransactions(user.transactions)
    const stats = this.transactionService.calculateStats(transactions)

    return {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      transactions,
      ...stats,
    }
  }

  async updateUserRole(
    id: string,
    role: 'USER' | 'ADMIN' | 'MANAGER'
  ): Promise<UserWithTransactions> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check if user has email (required for role changes)
    if (!user.email) {
      throw new BadRequestException('Cannot change role for users without email')
    }

    // Check if role is actually changing
    const isRoleChanging = user.role !== role
    if (!isRoleChanging) {
      this.logger.log(`Role for user ${id} is already ${role}, no change needed`)
      return this.calculateUserStats(user as any)
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        transactions: true,
      },
    })

    // Invalidate all user tokens due to role change
    try {
      console.log(
        `Starting token invalidation for user ${id} due to role change from ${user.role} to ${role}`
      )
      await this.tokenInvalidationService.invalidateAllUserTokens(id, 3600) // 1 hour
      this.logger.log(
        `All tokens invalidated for user ${id} due to role change from ${user.role} to ${role}`
      )
      console.log(`Token invalidation completed for user ${id}`)
    } catch (error) {
      this.logger.error(`Failed to invalidate tokens for user ${id}:`, error)
      console.error(`Token invalidation failed for user ${id}:`, error)
      // Don't throw error here, role change was successful
    }

    return this.calculateUserStats(updatedUser)
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Cannot delete admin users')
    }

    await this.prisma.user.delete({
      where: { id },
    })
  }

  async getUsersStatistics(): Promise<{
    totalUsers: number
    usersWithPurchases: number
    totalCoinsPurchased: number
    totalPendingTokens: number
    totalSpentSOL: number
    totalSpentUSDT: number
  }> {
    // Get all users (transactions are stored as JSON in the user record)
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        transactions: true,
      },
    })

    let totalUsers = users.length
    let usersWithPurchases = 0
    let totalCoinsPurchased = 0
    let totalPendingTokens = 0
    let totalSpentSOL = 0
    let totalSpentUSDT = 0

    users.forEach((user) => {
      const userStats = this.calculateUserStats(user)

      if (userStats.totalCoinsPurchased > 0) {
        usersWithPurchases++
      }

      totalCoinsPurchased += userStats.totalCoinsPurchased
      totalPendingTokens += userStats.totalPendingTokens
      totalSpentSOL += userStats.totalSpentSOL
      totalSpentUSDT += userStats.totalSpentUSDT
    })

    const result = {
      totalUsers,
      usersWithPurchases,
      totalCoinsPurchased,
      totalPendingTokens,
      totalSpentSOL,
      totalSpentUSDT,
    }

    return result
  }

  /**
   * Issue tokens to a specific user
   */
  async issueTokensToUser(userId: string): Promise<{success: boolean, amount: number, signature?: string}> {
    this.logger.log(`[ISSUE TOKENS] Starting token issuance for user: ${userId}`)
    
    const MAX_RETRIES = 3
    let lastError: Error | undefined
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`[ISSUE TOKENS] Attempt ${attempt}/${MAX_RETRIES} for user: ${userId}`)
        
        // Get user
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, walletAddress: true, transactions: true }
        })
        
        if (!user) {
          this.logger.error(`[ISSUE TOKENS] User not found: ${userId}`)
          throw new NotFoundException('User not found')
        }
        
        this.logger.log(`[ISSUE TOKENS] User wallet: ${user.walletAddress}`)
        
        // Parse transactions
        const transactions = this.transactionService.parseTransactions(user.transactions)
        this.logger.log(`[ISSUE TOKENS] Total transactions: ${transactions.length}`)
        
        // Calculate total pending using TransactionService (handles admin adjustments)
        const totalPending = this.transactionService.calculatePendingTokens(transactions)
        this.logger.log(`[ISSUE TOKENS] Total pending tokens (calc): ${totalPending}`)
        
        this.logger.log(`[ISSUE TOKENS] Total pending tokens: ${totalPending}`)
        
        if (totalPending === 0) {
          this.logger.warn(`[ISSUE TOKENS] No pending tokens for user: ${userId}`)
          return { success: false, amount: 0 }
        }
        
        // Check wallet balance
        const walletBalance = await this.walletService.getMintTokenBalance()
        this.logger.log(`[ISSUE TOKENS] Wallet balance: ${walletBalance}, Required: ${totalPending}`)
        
        if (walletBalance < totalPending) {
          this.logger.error(`[ISSUE TOKENS] Insufficient balance. Have: ${walletBalance}, Need: ${totalPending}`)
          throw new BadRequestException(`Insufficient wallet balance`)
        }
        
        // Send tokens
        this.logger.log(`[ISSUE TOKENS] Sending ${totalPending} tokens to ${user.walletAddress}`)
        if (!user.walletAddress) {
          this.logger.error(`[ISSUE TOKENS] User has no wallet address: ${userId}`)
          throw new BadRequestException('User has no wallet address')
        }
        const signature = await this.walletService.sendCoin(user.walletAddress, totalPending, 'COIN')
        
        this.logger.log(`[ISSUE TOKENS] Tokens sent. Signature: ${signature}`)
        
        // Update transactions using TransactionService - CRITICAL: Save immediately after successful send
        const updatedTransactions = this.transactionService.markTransactionsAsReceived(transactions)
        
        await this.prisma.user.update({
          where: { id: userId },
          data: { transactions: updatedTransactions }
        })
        
        this.logger.log(`[ISSUE TOKENS] Transaction records updated for user: ${userId}`)
        this.logger.log(`[ISSUE TOKENS] ✅ Successfully issued ${totalPending} tokens to user: ${userId}`)
        
        return { success: true, amount: totalPending, signature }
      } catch (error) {
        lastError = error
        this.logger.warn(`[ISSUE TOKENS] Attempt ${attempt}/${MAX_RETRIES} failed for user ${userId}:`, error.message)
        
        if (attempt < MAX_RETRIES) {
          const delay = 2000 * attempt // Exponential backoff: 2s, 4s, 6s
          this.logger.log(`[ISSUE TOKENS] Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    this.logger.error(`[ISSUE TOKENS] ❌ All ${MAX_RETRIES} attempts failed for user ${userId}:`, lastError)
    throw lastError || new Error('All retry attempts failed')
  }

  /**
   * Start issue all tokens process in background
   */
  async startIssueAllTokens(): Promise<string> {
    const processId = `issue-tokens-${Date.now()}`
    
    // Get users with pending tokens
    const users = await this.prisma.user.findMany({
      select: { id: true, walletAddress: true, transactions: true }
    })
    
    const usersWithPending = users.filter(user => {
      const transactions = this.transactionService.parseTransactions(user.transactions)
      const pendingAmount = this.transactionService.calculatePendingTokens(transactions)
      return pendingAmount > 0
    })
    
    // Save initial state in Redis (TTL: 1 hour)
    await this.redis.set(`issue-process:${processId}`, JSON.stringify({
      status: 'running',
      startTime: new Date().toISOString(),
      processed: 0,
      total: usersWithPending.length,
      users: []
    }), 'EX', 3600)
    
    // Start background process
    this.issueTokensToAllUsersBackground(processId).catch(err => {
      this.logger.error('Background issue failed:', err)
    })
    
    return processId
  }

  /**
   * Get issue process status
   */
  async getIssueProcessStatus(processId: string): Promise<any> {
    const data = await this.redis.get(`issue-process:${processId}`)
    if (!data) {
      throw new NotFoundException('Process not found')
    }
    return JSON.parse(data)
  }

  /**
   * Get active issue process
   */
  async getActiveIssueProcess(): Promise<any> {
    const keys = await this.redis.keys('issue-process:*')
    for (const key of keys) {
      const data = await this.redis.get(key)
      if (data) {
        const process = JSON.parse(data)
        if (process.status === 'running') {
          return { active: true, processId: key.replace('issue-process:', '') }
        }
      }
    }
    return { active: false }
  }

  /**
   * Issue tokens to all users with pending tokens (background)
   */
  async issueTokensToAllUsersBackground(processId: string): Promise<void> {
    this.logger.log('[ISSUE ALL TOKENS] ========================================')
    this.logger.log('[ISSUE ALL TOKENS] Starting background bulk token issuance')
    
    try {
      // Get all users with pending tokens
      const users = await this.prisma.user.findMany({
        select: { id: true, walletAddress: true, transactions: true }
      })
      
      this.logger.log(`[ISSUE ALL TOKENS] Total users in database: ${users.length}`)
      
      // Filter users with pending tokens
    const usersWithPending = users.filter(user => {
      const transactions = this.transactionService.parseTransactions(user.transactions)
      const pendingAmount = this.transactionService.calculatePendingTokens(transactions)
      return pendingAmount > 0
    })
      
      this.logger.log(`[ISSUE ALL TOKENS] Users with pending tokens: ${usersWithPending.length}`)
      
      if (usersWithPending.length === 0) {
        await this.redis.set(`issue-process:${processId}`, JSON.stringify({
          status: 'completed',
          startTime: new Date().toISOString(),
          processed: 0,
          total: 0,
          users: []
        }), 'EX', 3600)
        return
      }
      
      // Calculate total required
      const totalRequired = usersWithPending.reduce((sum, user) => {
        const transactions = this.transactionService.parseTransactions(user.transactions)
        const pendingAmount = this.transactionService.calculatePendingTokens(transactions)
        return sum + pendingAmount
      }, 0)
      
      this.logger.log(`[ISSUE ALL TOKENS] Total tokens required: ${totalRequired}`)
      
      // Check wallet balance
      const walletBalance = await this.walletService.getMintTokenBalance()
      this.logger.log(`[ISSUE ALL TOKENS] Current wallet balance: ${walletBalance}`)
      
      if (walletBalance < totalRequired) {
        await this.redis.set(`issue-process:${processId}`, JSON.stringify({
          status: 'failed',
          startTime: new Date().toISOString(),
          processed: 0,
          total: usersWithPending.length,
          users: [],
          error: `Insufficient wallet balance. Have: ${walletBalance}, Need: ${totalRequired}`
        }), 'EX', 3600)
        return
      }
      
      // Process each user
      let successCount = 0
      let failedCount = 0
      const processedUsers: any[] = []
      
      this.logger.log('[ISSUE ALL TOKENS] Starting individual user processing...')
      
      for (let i = 0; i < usersWithPending.length; i++) {
        const user = usersWithPending[i]
        const progress = `${i + 1}/${usersWithPending.length}`
        
        this.logger.log(`[ISSUE ALL TOKENS] [${progress}] Processing user: ${user.id}`)
        
        try {
          const result = await this.issueTokensToUser(user.id)
          
          if (result.success) {
            successCount++
            processedUsers.push({
              userId: user.id,
              wallet: user.walletAddress,
              amount: result.amount,
              status: 'success',
              timestamp: new Date().toISOString(),
              signature: result.signature
            })
            this.logger.log(`[ISSUE ALL TOKENS] [${progress}] ✅ Success for user: ${user.id}`)
          } else {
            failedCount++
            processedUsers.push({
              userId: user.id,
              wallet: user.walletAddress,
              amount: 0,
              status: 'failed',
              timestamp: new Date().toISOString(),
              error: 'No pending tokens'
            })
            this.logger.warn(`[ISSUE ALL TOKENS] [${progress}] ⚠️  No tokens to issue for user: ${user.id}`)
          }
        } catch (error) {
          failedCount++
          processedUsers.push({
            userId: user.id,
            wallet: user.walletAddress,
            amount: 0,
            status: 'failed',
            timestamp: new Date().toISOString(),
            error: error.message
          })
          this.logger.error(`[ISSUE ALL TOKENS] [${progress}] ❌ Failed for user ${user.id}:`, error.message)
        }
        
        // Update Redis with progress
        await this.redis.set(`issue-process:${processId}`, JSON.stringify({
          status: 'running',
          startTime: new Date().toISOString(),
          processed: i + 1,
          total: usersWithPending.length,
          users: processedUsers
        }), 'EX', 3600)
        
        // Small delay between users to avoid rate limits
        if (i < usersWithPending.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // Mark as completed
      await this.redis.set(`issue-process:${processId}`, JSON.stringify({
        status: 'completed',
        startTime: new Date().toISOString(),
        processed: usersWithPending.length,
        total: usersWithPending.length,
        users: processedUsers
      }), 'EX', 3600)
      
      this.logger.log('[ISSUE ALL TOKENS] ========================================')
      this.logger.log(`[ISSUE ALL TOKENS] ✅ Background issuance completed`)
      this.logger.log(`[ISSUE ALL TOKENS] Success: ${successCount}, Failed: ${failedCount}, Total: ${usersWithPending.length}`)
      this.logger.log('[ISSUE ALL TOKENS] ========================================')
      
    } catch (error) {
      this.logger.error('[ISSUE ALL TOKENS] Background process failed:', error)
      await this.redis.set(`issue-process:${processId}`, JSON.stringify({
        status: 'failed',
        startTime: new Date().toISOString(),
        processed: 0,
        total: 0,
        users: [],
        error: error.message
      }), 'EX', 3600)
    }
  }

  /**
   * Issue tokens to all users with pending tokens (legacy method)
   */
  async issueTokensToAllUsers(): Promise<{
    success: number
    failed: number
    totalProcessed: number
    details: Array<{userId: string, status: string, amount?: number, error?: string}>
  }> {
    this.logger.log('[ISSUE ALL TOKENS] ========================================')
    this.logger.log('[ISSUE ALL TOKENS] Starting bulk token issuance')
    
    try {
      // Get all users with pending tokens
      const users = await this.prisma.user.findMany({
        select: { id: true, walletAddress: true, transactions: true }
      })
      
      this.logger.log(`[ISSUE ALL TOKENS] Total users in database: ${users.length}`)
      
      // Filter users with pending tokens
      const usersWithPending = users.filter(user => {
        const transactions = this.transactionService.parseTransactions(user.transactions)
        const pending = transactions.filter(tx => tx.isSuccessful && !tx.isReceived)
        return pending.length > 0
      })
      
      this.logger.log(`[ISSUE ALL TOKENS] Users with pending tokens: ${usersWithPending.length}`)
      
      if (usersWithPending.length === 0) {
        this.logger.log('[ISSUE ALL TOKENS] No users with pending tokens')
        return { success: 0, failed: 0, totalProcessed: 0, details: [] }
      }
      
      // Calculate total required
      const totalRequired = usersWithPending.reduce((sum, user) => {
        const transactions = this.transactionService.parseTransactions(user.transactions)
        const pendingAmount = this.transactionService.calculatePendingTokens(transactions)
        return sum + pendingAmount
      }, 0)
      
      this.logger.log(`[ISSUE ALL TOKENS] Total tokens required: ${totalRequired}`)
      
      // Check wallet balance
      const walletBalance = await this.walletService.getMintTokenBalance()
      this.logger.log(`[ISSUE ALL TOKENS] Current wallet balance: ${walletBalance}`)
      
      if (walletBalance < totalRequired) {
        this.logger.error(`[ISSUE ALL TOKENS] Insufficient balance. Have: ${walletBalance}, Need: ${totalRequired}`)
        throw new BadRequestException(`Insufficient wallet balance for all users`)
      }
      
      // Process each user
      let successCount = 0
      let failedCount = 0
      const details: Array<{userId: string, status: string, amount?: number, error?: string}> = []
      
      this.logger.log('[ISSUE ALL TOKENS] Starting individual user processing...')
      
      for (let i = 0; i < usersWithPending.length; i++) {
        const user = usersWithPending[i]
        const progress = `${i + 1}/${usersWithPending.length}`
        
        this.logger.log(`[ISSUE ALL TOKENS] [${progress}] Processing user: ${user.id}`)
        
        try {
          const result = await this.issueTokensToUser(user.id)
          
          if (result.success) {
            successCount++
            details.push({
              userId: user.id,
              status: 'success',
              amount: result.amount
            })
            this.logger.log(`[ISSUE ALL TOKENS] [${progress}] ✅ Success for user: ${user.id}`)
          } else {
            failedCount++
            details.push({
              userId: user.id,
              status: 'failed',
              error: 'No pending tokens'
            })
            this.logger.warn(`[ISSUE ALL TOKENS] [${progress}] ⚠️  No tokens to issue for user: ${user.id}`)
          }
        } catch (error) {
          failedCount++
          details.push({
            userId: user.id,
            status: 'failed',
            error: error.message
          })
          this.logger.error(`[ISSUE ALL TOKENS] [${progress}] ❌ Failed for user ${user.id}:`, error.message)
        }
        
        // Small delay between users to avoid rate limits
        if (i < usersWithPending.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      this.logger.log('[ISSUE ALL TOKENS] ========================================')
      this.logger.log(`[ISSUE ALL TOKENS] ✅ Bulk issuance completed`)
      this.logger.log(`[ISSUE ALL TOKENS] Success: ${successCount}, Failed: ${failedCount}, Total: ${usersWithPending.length}`)
      this.logger.log('[ISSUE ALL TOKENS] ========================================')
      
      return {
        success: successCount,
        failed: failedCount,
        totalProcessed: usersWithPending.length,
        details
      }
    } catch (error) {
      this.logger.error('[ISSUE ALL TOKENS] ❌ Critical error in bulk issuance:', error)
      throw error
    }
  }

  /**
   * Get wallet token balance
   */
  async getWalletTokenBalance(): Promise<number> {
    return await this.walletService.getMintTokenBalance()
  }

  /**
   * Validate token balance for a user or all users
   */
  async validateTokenBalance(userId?: string): Promise<{
    hasEnough: boolean
    walletBalance: number
    requiredAmount: number
  }> {
    this.logger.log(`[VALIDATE BALANCE] Checking balance for: ${userId || 'all users'}`)
    
    try {
      const walletBalance = await this.walletService.getMintTokenBalance()
      this.logger.log(`[VALIDATE BALANCE] Current wallet balance: ${walletBalance}`)
      
      let requiredAmount = 0
      
      if (userId) {
        // Single user
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { transactions: true }
        })
        
        if (user) {
          const transactions = this.transactionService.parseTransactions(user.transactions)
          requiredAmount = this.transactionService.calculatePendingTokens(transactions)
          this.logger.log(`[VALIDATE BALANCE] User ${userId} requires: ${requiredAmount}`)
        }
      } else {
        // All users
        const users = await this.prisma.user.findMany({
          select: { transactions: true }
        })
        
        requiredAmount = users.reduce((sum, user) => {
          const transactions = this.transactionService.parseTransactions(user.transactions)
          const pendingAmount = this.transactionService.calculatePendingTokens(transactions)
          return sum + pendingAmount
        }, 0)
        
        this.logger.log(`[VALIDATE BALANCE] All users require: ${requiredAmount}`)
      }
      
      const hasEnough = walletBalance >= requiredAmount
      this.logger.log(`[VALIDATE BALANCE] Has enough: ${hasEnough} (Balance: ${walletBalance}, Required: ${requiredAmount})`)
      
      return { hasEnough, walletBalance, requiredAmount }
    } catch (error) {
      this.logger.error('[VALIDATE BALANCE] Error:', error)
      throw error
    }
  }
}
