import { useState, useEffect } from 'react'
import { usersApi, type UserWithTransactions } from '@/services/usersApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { Notify } from '@/services/notify'
import type { UsersStatistics } from './types'

export const usePresale = () => {
  const [presaleSettings, setPresaleSettings] = useState<CoinPresaleSettings | null>(null)
  const [users, setUsers] = useState<UserWithTransactions[]>([])
  const [usersStatistics, setUsersStatistics] = useState<UsersStatistics | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined)
  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [issuingTokens, setIssuingTokens] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithTransactions | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'issued'>('all')

  const loadInitialData = async () => {
    try {
      setInitialLoading(true)
      const [settingsData, statisticsData, walletBalanceData] = await Promise.all([
        coinApi.getPresaleSettings(),
        usersApi.getUsersStatistics(),
        usersApi.getWalletTokenBalance()
      ])
      setPresaleSettings(settingsData)
      setUsersStatistics(statisticsData)
      setWalletBalance(walletBalanceData)
    } catch (err) {
      Notify.error('Failed to load presale data')
      console.error('Error loading presale data:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const loadUsersData = async () => {
    try {
      setUsersLoading(true)
      const usersData = await usersApi.getUsers(currentPage, 10, 'createdAt', 'desc', undefined, filterType)
      setUsers(usersData.users)
      setTotalPages(usersData.totalPages)
    } catch (err) {
      Notify.error('Failed to load users data')
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleIssueAllTokens = async () => {
    try {
      setIssuingTokens(true)
      
      // Validate balance first
      const validation = await usersApi.validateTokenBalance()
      if (!validation.hasEnough) {
        Notify.error(`Insufficient wallet balance. Required: ${validation.requiredAmount}, Available: ${validation.walletBalance}`)
        return
      }
      
      // Issue tokens to all users
      const result = await usersApi.issueAllTokens()
      
      if (result.success > 0) {
        Notify.success(`Successfully issued tokens to ${result.success} users. ${result.failed} failed.`)
        // Reload data to reflect changes
        await loadInitialData()
        await loadUsersData()
      } else {
        Notify.warning('No tokens were issued. All users may already have their tokens.')
      }
    } catch (err) {
      Notify.error('Failed to issue tokens')
      console.error(err)
    } finally {
      setIssuingTokens(false)
    }
  }

  const handleIssueUserTokens = async (userId: string) => {
    try {
      // Validate balance first
      const validation = await usersApi.validateTokenBalance(userId)
      if (!validation.hasEnough) {
        Notify.error(`Insufficient wallet balance. Required: ${validation.requiredAmount}, Available: ${validation.walletBalance}`)
        return
      }
      
      // Issue tokens to specific user
      const result = await usersApi.issueTokensToUser(userId)
      
      if (result.success) {
        Notify.success(`Successfully issued ${result.amount} tokens to user`)
        // Reload data to reflect changes
        await loadInitialData()
        await loadUsersData()
      } else {
        Notify.warning('No tokens to issue for this user')
      }
    } catch (err) {
      Notify.error('Failed to issue tokens to user')
      console.error(err)
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = await usersApi.getUserById(userId)
      setSelectedUser(user)
      return true
    } catch (err) {
      Notify.error('Failed to load user details')
      console.error(err)
      return false
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (newFilterType: 'all' | 'pending' | 'issued') => {
    setFilterType(newFilterType)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const openSolscan = (txHash: string) => {
    const solscanUrl = `https://solscan.io/tx/${txHash}`
    window.open(solscanUrl, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatWalletAddress = (address: string | null) => {
    if (!address) return 'No wallet'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: number) => {
    if (isNaN(amount) || !amount) return '0'
  
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadUsersData()
  }, [currentPage, filterType])

  return {
    // State
    presaleSettings,
    users,
    usersStatistics,
    walletBalance,
    initialLoading,
    usersLoading,
    issuingTokens,
    selectedUser,
    setSelectedUser,
    currentPage,
    totalPages,
    filterType,
    
    // Actions
    loadInitialData,
    loadUsersData,
    handleIssueAllTokens,
    handleIssueUserTokens,
    handleViewUser,
    handlePageChange,
    handleFilterChange,
    openSolscan,
    
    // Utils
    formatDate,
    formatWalletAddress,
    formatAmount,
  }
}
