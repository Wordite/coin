import { useState, useEffect } from 'react'
import { usersApi, type UserWithTransactions } from '@/services/usersApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { Notify } from '@/services/notify'
import type { UsersStatistics } from './types'

export const usePresale = () => {
  const [presaleSettings, setPresaleSettings] = useState<CoinPresaleSettings | null>(null)
  const [users, setUsers] = useState<UserWithTransactions[]>([])
  const [usersStatistics, setUsersStatistics] = useState<UsersStatistics | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [issuingTokens, setIssuingTokens] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithTransactions | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadInitialData = async () => {
    try {
      setInitialLoading(true)
      const [settingsData, statisticsData] = await Promise.all([
        coinApi.getPresaleSettings(),
        usersApi.getUsersStatistics()
      ])
      setPresaleSettings(settingsData)
      setUsersStatistics(statisticsData)
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
      const usersData = await usersApi.getUsers(currentPage, 10, 'createdAt', 'desc')
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
      // TODO: Implement real token issuance logic
      console.log('Issuing tokens to all users...')
      
      Notify.success('Tokens issued to all users successfully')
    } catch (err) {
      Notify.error('Failed to issue tokens')
      console.error(err)
    } finally {
      setIssuingTokens(false)
    }
  }

  const handleIssueUserTokens = async (userId: string) => {
    try {
      // TODO: Implement real token issuance logic for specific user
      console.log('Issuing tokens to user:', userId)
      
      Notify.success('Tokens issued to user successfully')
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
  }, [currentPage])

  return {
    // State
    presaleSettings,
    users,
    usersStatistics,
    initialLoading,
    usersLoading,
    issuingTokens,
    selectedUser,
    setSelectedUser,
    currentPage,
    totalPages,
    
    // Actions
    loadInitialData,
    loadUsersData,
    handleIssueAllTokens,
    handleIssueUserTokens,
    handleViewUser,
    handlePageChange,
    openSolscan,
    
    // Utils
    formatDate,
    formatWalletAddress,
    formatAmount,
  }
}
