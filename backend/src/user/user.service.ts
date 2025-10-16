import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Roles } from 'src/auth/constants/roles.constant'
import { User } from '@prisma/client'
import { TokenInvalidationService } from 'src/auth/services/token-invalidation.service'
import { SolanaService } from 'src/solana/solana.service'
import { WalletService } from 'src/wallet/wallet.service'
import { AntiSpamService } from 'src/anti-spam/anti-spam.service'
import { SettingsService } from 'src/settings/settings.service'
import { Request } from 'express'

// ===== INTERFACES FOR USERS MANAGEMENT =====

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
    private settingsService: SettingsService
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
    try {
      console.log(`Purchasing coins for address: ${address}`) 
      const rootWalletAddress = await this.walletService.getPublicKey()
      const txData = await this.solanaService.getTransactionData(transaction.signature)

      this.logger.log(`Transaction data: ${JSON.stringify(txData)}`)

      // Дополнительная проверка статуса транзакции
      const connection = this.solanaService.getConnection()
      const status = await connection.getSignatureStatuses([transaction.signature], { searchTransactionHistory: true })
      const info = status && status.value[0]
      const errFromStatus = info?.err
      const confirmationStatus = info?.confirmationStatus
      const errFromTxData = txData?.meta?.err
      const effectiveErr = errFromTxData !== undefined ? errFromTxData : errFromStatus

      this.logger.log(
        `Transaction status check: errFromTxData=${JSON.stringify(errFromTxData)}, errFromStatus=${JSON.stringify(errFromStatus)}, confirmationStatus=${confirmationStatus}`
      )

      // Если ни txData, ни status не дали результата - транзакция не найдена
      if (!txData && !info) {
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

      // Проверяем наличие ошибок, используя доступные данные
      if (effectiveErr !== null && effectiveErr !== undefined) {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 30, {
            reason: 'transaction_rejected',
            address,
            signature: transaction.signature,
            error: effectiveErr,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction was rejected')
      }

      // Если есть информация о статусе, убеждаемся, что транзакция финализирована
      if (info && confirmationStatus !== 'finalized') {
        if (req) {
          const key = req.ip || 'unknown'
          await this.antiSpamService.addPoints(key, 15, {
            reason: 'transaction_not_finalized',
            address,
            signature: transaction.signature,
            confirmationStatus,
            ip: req.ip,
            ua: req.get?.('user-agent'),
            timestamp: Date.now()
          })
        }
        throw new BadRequestException('Transaction is not finalized yet')
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

      this.logger.log(`Root wallet address: ${rootWalletAddress}`)

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
      
      const isSuccessful = (effectiveErr === null || effectiveErr === undefined) && (info ? confirmationStatus === 'finalized' : true)
      
      const settings = await this.settingsService.getSettings()
      const rate = transaction.type === 'SOL' 
        ? (settings?.solToCoinRate || 0) 
        : (settings?.usdtToCoinRate || 0)
      
      const coinsPurchased = isSuccessful 
        ? Math.floor((transaction.amount || 0) * rate) 
        : 0
      
      const newTransaction: Transaction = {
        id: transaction.signature,
        type: transaction.type || 'SOL',
        amount: transaction.amount || 0,
        rate: rate,
        coinsPurchased: coinsPurchased,
        timestamp: new Date().toISOString(),
        txHash: transaction.signature,
        isReceived: false,
        isSuccessful
      }

      console.log('newTransaction', newTransaction)
      
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
      
      const currentTransactions = user.transactions ? JSON.parse(user.transactions as string) : []
      const updatedTransactions = [...currentTransactions, newTransaction]
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          transactions: JSON.stringify(updatedTransactions)
        }
      })
      
      this.logger.log(`Transaction ${transaction.signature} processed for user ${address}`)
      
    } catch (error) {
      this.logger.error(`Error processing transaction: ${error.message}`)
      
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
    search?: string
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

    const [users, total] = await Promise.all([
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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

    const transactions = (user.transactions as any as Transaction[]) || []

    // Calculate current total coins
    const currentTotalCoins = transactions.reduce((sum, tx) => sum + tx.coinsPurchased, 0)
    console.log('currentTotalCoins', currentTotalCoins)

    // Create adjustment transaction
    const adjustmentAmount = newCoinsAmount - currentTotalCoins
    console.log('adjustmentAmount', adjustmentAmount)
    const adjustmentTransaction: Transaction = {
      id: `adjustment-${Date.now()}`,
      type: 'SOL', // Default type for adjustments
      amount: 0,
      rate: 0,
      coinsPurchased: adjustmentAmount,
      timestamp: new Date().toISOString(),
      txHash: 'ADMIN_ADJUSTMENT',
      isReceived: true,
      isSuccessful: true,
    }

    const updatedTransactions = [...transactions, adjustmentTransaction]

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
    // Handle transactions as JSON string or array
    let transactions: Transaction[] = []
    if (user.transactions) {
      if (typeof user.transactions === 'string') {
        try {
          transactions = JSON.parse(user.transactions) || []
        } catch (error) {
          console.error('Error parsing transactions JSON:', error)
          transactions = []
        }
      } else if (Array.isArray(user.transactions)) {
        transactions = user.transactions
      }
    }

    const totalSpentSOL = transactions
      .filter((tx) => tx.type === 'SOL')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalSpentUSDT = transactions
      .filter((tx) => tx.type === 'USDT')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalCoinsPurchased = transactions.reduce((sum, tx) => sum + tx.coinsPurchased, 0)

    const totalCoinsReceived = transactions
      .filter((tx) => tx.isReceived)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)

    const totalPendingTokens = transactions
      .filter((tx) => tx.isSuccessful && !tx.isReceived)
      .reduce((sum, tx) => sum + tx.coinsPurchased, 0)

    return {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      transactions,
      totalSpentSOL,
      totalSpentUSDT,
      totalCoinsPurchased,
      totalCoinsReceived,
      totalPendingTokens,
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
}
