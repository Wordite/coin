import { useState, useEffect } from 'react'
import { Notify } from '@/services/notify'
import { settingsApi } from '@/services/settingsApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { api } from '@/app/api'
import type { SettingsData, RootWalletInfo, VaultStatus } from './types'

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: '',
    siteLogo: '',
    siteDescription: '',
    presaleEndDateTime: '',
    presaleActive: false,
    usdtToCoinRate: 0,
    solToCoinRate: 0,
  })
  
  const [presaleSettings, setPresaleSettings] = useState<CoinPresaleSettings>({
    totalAmount: 0,
    stage: 1,
    soldAmount: 0,
    currentAmount: 0,
    status: 'PRESALE',
    name: 'Coin',
    decimals: 6,
    minBuyAmount: 100,
    maxBuyAmount: 1000000,
    mintAddress: '',
    rpc: '',
    rpcEndpoints: [],
  })
  
  const [availableStages, setAvailableStages] = useState<number[]>([1, 2, 3, 4, 5])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Vault states
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>({ isConnected: false })
  const [walletInfo, setWalletInfo] = useState<RootWalletInfo>({ isInitialized: false })
  const [vaultLoading, setVaultLoading] = useState(false)
  const [newSecretKey, setNewSecretKey] = useState('')
  const [forceInitialize, setForceInitialize] = useState(false)

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Загружаем основные настройки
      const settingsResponse = await settingsApi.getSettings()
      setSettings(settingsResponse)
      
      // Загружаем настройки пресейла
      const presaleResponse = await coinApi.getPresaleSettings()
      setPresaleSettings(presaleResponse)
      
      // Загружаем доступные этапы
      const stagesResponse = await coinApi.getAvailableStages()
      setAvailableStages(stagesResponse)
      
    } catch (error) {
      console.error('Failed to load settings:', error)
      Notify.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Сохраняем основные настройки
      await settingsApi.updateSettings(settings)
      
      // Сохраняем настройки пресейла
      await coinApi.updatePresaleSettings(presaleSettings)
      
      Notify.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      Notify.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const checkVaultStatus = async () => {
    try {
      const response = await api.get('/vault/status')
      setVaultStatus({
        isConnected: response.data.isConnected,
        error: response.data.error
      })
    } catch (error) {
      console.error('Vault status check failed:', error)
      setVaultStatus({ isConnected: false, error: 'Failed to connect to Vault' })
    }
  }

  const getWalletInfo = async () => {
    try {
      const response = await api.get('/vault/root-wallet')
      setWalletInfo({
        isInitialized: response.data.isInitialized,
        updatedAt: response.data.updatedAt
      })
    } catch (error) {
      console.error('Failed to get wallet info:', error)
      setWalletInfo({ isInitialized: false })
    }
  }

  const initializeWallet = async () => {
    if (!newSecretKey.trim()) {
      Notify.error('Please enter a secret key')
      return false
    }

    setVaultLoading(true)
    try {
      const response = await api.post('/vault/root-wallet', {
        secretKey: newSecretKey.trim(),
        force: forceInitialize
      })

      // Проверяем, что ответ содержит корректные данные
      if (response.data && response.data.isInitialized && response.data.updatedAt) {
        setWalletInfo({
          isInitialized: true,
          updatedAt: response.data.updatedAt
        })
        setNewSecretKey('')
        setForceInitialize(false)
        Notify.success('Root wallet initialized successfully!')
        return true
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Failed to initialize wallet:', error)
      
      // Обрабатываем разные типы ошибок
      let errorMessage = 'Failed to initialize wallet'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Notify.error(errorMessage)
      
      // Обновляем статус кошелька в случае ошибки
      await getWalletInfo()
      return false
    } finally {
      setVaultLoading(false)
    }
  }

  const updateWallet = async () => {
    if (!newSecretKey.trim()) {
      Notify.error('Please enter a new secret key')
      return false
    }

    setVaultLoading(true)
    try {
      const response = await api.put('/vault/root-wallet', {
        secretKey: newSecretKey.trim()
      })

      if (response.data && response.data.isInitialized && response.data.updatedAt) {
        setWalletInfo({
          isInitialized: true,
          updatedAt: response.data.updatedAt
        })
        setNewSecretKey('')
        Notify.success('Root wallet updated successfully!')
        return true
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Failed to update wallet:', error)
      
      let errorMessage = 'Failed to update wallet'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Notify.error(errorMessage)
      
      await getWalletInfo()
      return false
    } finally {
      setVaultLoading(false)
    }
  }

  const deleteWallet = async () => {
    setVaultLoading(true)
    try {
      await api.delete('/vault/root-wallet')
      
      setWalletInfo({ isInitialized: false })
      Notify.success('Root wallet deleted successfully!')
      return true
    } catch (error: any) {
      console.error('Failed to delete wallet:', error)
      
      let errorMessage = 'Failed to delete wallet'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Notify.error(errorMessage)
      return false
    } finally {
      setVaultLoading(false)
    }
  }

  const handleModalClose = () => {
    setNewSecretKey('')
    setForceInitialize(false)
  }

  useEffect(() => {
    loadSettings()
    checkVaultStatus()
    getWalletInfo()
  }, [])

  return {
    // State
    settings,
    setSettings,
    presaleSettings,
    setPresaleSettings,
    availableStages,
    setAvailableStages,
    loading,
    saving,
    vaultStatus,
    walletInfo,
    vaultLoading,
    newSecretKey,
    setNewSecretKey,
    forceInitialize,
    setForceInitialize,
    
    // Actions
    loadSettings,
    handleSave,
    checkVaultStatus,
    getWalletInfo,
    initializeWallet,
    updateWallet,
    deleteWallet,
    handleModalClose,
  }
}
