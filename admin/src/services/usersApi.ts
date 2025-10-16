import { api } from '../app/api'

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

class UsersApiService {
  async getUsers(page: number = 1, limit: number = 10, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc', search?: string, filterType?: 'all' | 'pending' | 'issued'): Promise<UsersListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })
    
    if (search && search.trim()) {
      params.append('search', search.trim())
    }
    
    if (filterType && filterType !== 'all') {
      params.append('filterType', filterType)
    }
    
    const response = await api.get(`/user/list?${params.toString()}`)
    return response.data
  }

  async getUserById(id: string): Promise<UserWithTransactions> {
    const response = await api.get(`/user/${id}`)
    return response.data
  }

  async updateUserCoins(id: string, newCoinsAmount: number): Promise<UserWithTransactions> {
    const response = await api.put(`/user/${id}/coins`, { newCoinsAmount })
    return response.data
  }

  async updateUserRole(id: string, role: 'USER' | 'ADMIN' | 'MANAGER'): Promise<UserWithTransactions> {
    const response = await api.put(`/user/${id}/role`, { role })
    return response.data
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/user/${id}`)
    return response.data
  }

  async getUsersStatistics(): Promise<{
    totalUsers: number
    usersWithPurchases: number
    totalCoinsPurchased: number
    totalPendingTokens: number
    totalSpentSOL: number
    totalSpentUSDT: number
  }> {
    const response = await api.get('/user/statistics')
    return response.data
  }
}

export const usersApi = new UsersApiService()