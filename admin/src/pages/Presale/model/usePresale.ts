import { useState, useEffect } from 'react'
import { usersApi, type UserWithTransactions } from '@/services/usersApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { Notify } from '@/services/notify'
import type { UsersStatistics } from './types'
import { api } from '@/app/api'

export const usePresale = () => {
  const [presaleSettings, setPresaleSettings] = useState<CoinPresaleSettings | null>(null)
  const [users, setUsers] = useState<UserWithTransactions[]>([])
  const [usersStatistics, setUsersStatistics] = useState<UsersStatistics | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined)
  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [issuingTokens, setIssuingTokens] = useState(false)
  const [issuingUserId, setIssuingUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithTransactions | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'issued'>('all')
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null)
  const [showIssueModal, setShowIssueModal] = useState(false)

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

  const checkActiveProcess = async () => {
    try {
      const response = await api.get('/user/issue-all-tokens/active')
      if (response.data.active) {
        setActiveProcessId(response.data.processId)
        setShowIssueModal(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to check active process:', error)
      return false
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
      
      // Start background process
      const response = await api.post('/user/issue-all-tokens')
      const { processId } = response.data
      
      setActiveProcessId(processId)
      setShowIssueModal(true)
      Notify.success('Token issuance process started. Monitor progress in the modal.')
      
    } catch (err) {
      Notify.error('Failed to start token issuance process')
      console.error(err)
    } finally {
      setIssuingTokens(false)
    }
  }

  const handleCloseIssueModal = () => {
    setShowIssueModal(false)
    setActiveProcessId(null)
    // Reload data to reflect changes
    loadInitialData()
    loadUsersData()
  }

  const handleIssueUserTokens = async (userId: string) => {
    try {
      setIssuingUserId(userId)
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
        Notify.warn('No tokens to issue for this user')
      }
    } catch (err) {
      Notify.error('Failed to issue tokens to user')
      console.error(err)
    } finally {
      setIssuingUserId(null)
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
    // Check for active process on page load
    checkActiveProcess()
  }, [])

  useEffect(() => {
    loadUsersData()
  }, [currentPage, filterType])

  // Listen for presale settings updates from settings page
  useEffect(() => {
    const handlePresaleSettingsUpdate = () => {
      console.log('Presale settings updated, refreshing data...')
      loadInitialData()
    }

    window.addEventListener('presaleSettingsUpdated', handlePresaleSettingsUpdate)
    
    return () => {
      window.removeEventListener('presaleSettingsUpdated', handlePresaleSettingsUpdate)
    }
  }, [])

  return {
    // State
    presaleSettings,
    users,
    usersStatistics,
    walletBalance,
    initialLoading,
    usersLoading,
    issuingTokens,
    issuingUserId,
    selectedUser,
    setSelectedUser,
    currentPage,
    totalPages,
    filterType,
    activeProcessId,
    showIssueModal,
    
    // Actions
    loadInitialData,
    loadUsersData,
    handleIssueAllTokens,
    handleIssueUserTokens,
    handleViewUser,
    handlePageChange,
    handleFilterChange,
    handleCloseIssueModal,
    openSolscan,
    
    // Utils
    formatDate,
    formatWalletAddress,
    formatAmount,
  }
}
