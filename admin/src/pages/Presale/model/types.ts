import type { CoinPresaleSettings } from '@/services/coinApi'
import type { UserWithTransactions } from '@/services/usersApi'

export interface UsersStatistics {
  totalUsers: number
  usersWithPurchases: number
  usersWithPendingTokens: number
  totalCoinsPurchased: number
  totalPendingTokens: number
  totalSpentSOL: number
  totalSpentUSDT: number
}

export interface PresaleOverviewProps {
  presaleSettings: CoinPresaleSettings
  presaleProgress: number
  walletBalance?: number
}

export interface TokenDistributionProps {
  totalPendingTokens: number
  usersWithPendingTokens: number
  issuingTokens: boolean
  onIssueAllTokens: () => void
  activeProcessId?: string | null
  onViewProgress?: () => void
}

export interface UsersTableProps {
  users: UserWithTransactions[]
  usersLoading: boolean
  onViewUser: (userId: string) => void
  onIssueUserTokens: (userId: string) => void
  filterType?: 'all' | 'pending' | 'issued'
  onFilterChange?: (filterType: 'all' | 'pending' | 'issued') => void
  issuingUserId?: string | null
}

export interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUser: UserWithTransactions | null
  onOpenSolscan: (txHash: string) => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  usersLoading: boolean
  onPageChange: (page: number) => void
}
