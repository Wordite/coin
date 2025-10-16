import type { CoinPresaleSettings } from '@/services/coinApi'
import type { UserWithTransactions } from '@/services/usersApi'

export interface UsersStatistics {
  totalUsers: number
  usersWithPurchases: number
  totalCoinsPurchased: number
  totalPendingTokens: number
  totalSpentSOL: number
  totalSpentUSDT: number
}

export interface PresaleOverviewProps {
  presaleSettings: CoinPresaleSettings
  presaleProgress: number
}

export interface TokenDistributionProps {
  totalPendingTokens: number
  usersWithPendingTokens: number
  issuingTokens: boolean
  onIssueAllTokens: () => void
}

export interface UsersTableProps {
  users: UserWithTransactions[]
  usersLoading: boolean
  onViewUser: (userId: string) => void
  onIssueUserTokens: (userId: string) => void
  filterType?: 'all' | 'pending' | 'issued'
  onFilterChange?: (filterType: 'all' | 'pending' | 'issued') => void
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
