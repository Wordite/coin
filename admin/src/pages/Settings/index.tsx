import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Divider,
  Switch,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react'
import { Notify } from '@/services/notify'
import { settingsApi } from '@/services/settingsApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { ImagePicker } from '@/widgets/ImagePicker'
import type { MediaFile } from '@/pages/MediaLibrary/model'
import { useMedia } from '@/pages/MediaLibrary/model'
import { api } from '@/app/api'
import { RootWalletManagement } from './components'

interface SettingsData {
  // Site Settings
  siteName: string
  siteLogo: string
  siteDescription: string
  
  // Presale Settings
  presaleEndDateTime: string // ISO string format
  presaleActive: boolean
  
  // Exchange Rates
  usdtToCoinRate: number
  solToCoinRate: number
}

interface RootWalletInfo {
  isInitialized: boolean
  updatedAt?: string
}

interface VaultStatus {
  isConnected: boolean
  error?: string
}

const Settings = () => {
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
  })
  
  const [availableStages, setAvailableStages] = useState<number[]>([1, 2, 3, 4, 5])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<MediaFile | null>(null)
  const { mediaFiles } = useMedia()

  // Vault states
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>({ isConnected: false })
  const [walletInfo, setWalletInfo] = useState<RootWalletInfo>({ isInitialized: false })
  const [vaultLoading, setVaultLoading] = useState(false)
  const [newSecretKey, setNewSecretKey] = useState('')
  const [forceInitialize, setForceInitialize] = useState(false)
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure()

  const handleModalClose = () => {
    setNewSecretKey('')
    setForceInitialize(false)
    onClose()
  }

  useEffect(() => {
    loadSettings()
    checkVaultStatus()
    getWalletInfo()
  }, [])


  // Update logo when media files are loaded
  useEffect(() => {
    if (settings.siteLogo && mediaFiles.length > 0 && !selectedLogo) {
      const logoFile = mediaFiles.find(file => file.url === settings.siteLogo)
      if (logoFile) {
        setSelectedLogo(logoFile)
      }
    }
  }, [mediaFiles, settings.siteLogo, selectedLogo])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const [settingsData, presaleData, stagesData] = await Promise.all([
        settingsApi.getSettings(),
        coinApi.getPresaleSettings(),
        coinApi.getAvailableStages()
      ])
      setSettings(settingsData)
      setPresaleSettings(presaleData)
      setAvailableStages(stagesData)
    } catch (err) {
      Notify.error('Failed to load settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoSelect = (images: MediaFile[]) => {
    const logo = images[0] || null
    setSelectedLogo(logo)
    setSettings(prev => ({
      ...prev,
      siteLogo: logo ? logo.url : ''
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await Promise.all([
        settingsApi.updateSettings(settings),
        coinApi.updatePresaleSettings(presaleSettings)
      ])
      Notify.success('Settings saved successfully')
    } catch (err) {
      Notify.error('Failed to save settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePresaleChange = (field: keyof CoinPresaleSettings, value: any) => {
    setPresaleSettings(prev => ({ ...prev, [field]: value }))
  }

  // Vault functions
  const checkVaultStatus = async () => {
    try {
      const response = await api.get('/vault/status')
      setVaultStatus({ isConnected: response.data.isConnected })
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
      return
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
        onOpenChange()
        Notify.success('Root wallet initialized successfully!')
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
    } finally {
      setVaultLoading(false)
    }
  }

  const updateWallet = async () => {
    if (!newSecretKey.trim()) {
      Notify.error('Please enter a new secret key')
      return
    }

    setVaultLoading(true)
    try {
      const response = await api.put('/vault/root-wallet', {
        secretKey: newSecretKey.trim()
      })

      // Проверяем, что ответ содержит корректные данные
      if (response.data && response.data.isInitialized && response.data.updatedAt) {
        setWalletInfo({
          isInitialized: true,
          updatedAt: response.data.updatedAt
        })
        setNewSecretKey('')
        setForceInitialize(false)
        onOpenChange()
        Notify.success('Root wallet updated successfully!')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Failed to update wallet:', error)
      
      // Обрабатываем разные типы ошибок
      let errorMessage = 'Failed to update wallet'
      
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
    } finally {
      setVaultLoading(false)
    }
  }

  const deleteWallet = async () => {
    setVaultLoading(true)
    try {
      await api.delete('/vault/root-wallet')
      
      setWalletInfo({ isInitialized: false })
      onDeleteOpenChange()
      Notify.success('Root wallet deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete wallet:', error)
      const errorMessage = error.response?.data?.error || 'Failed to delete wallet'
      Notify.error(errorMessage)
    } finally {
      setVaultLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground/60 mt-1">Manage global site settings and presale configuration</p>
        </div>
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={saving}
          startContent={!saving && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Site Settings</h2>
              <p className="text-sm text-foreground/60">Configure basic site information</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Site Name"
            placeholder="Enter site name"
            value={settings.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">
              Site Logo (SVG format recommended)
            </label>
            <ImagePicker
              onSelect={handleLogoSelect}
              selectedImages={selectedLogo ? [selectedLogo] : []}
              placeholder="Select site logo (SVG format recommended)..."
              className="w-full"
            />
            {selectedLogo && (
              <div className="mt-2 p-2 bg-content2 rounded-lg">
                <p className="text-xs text-foreground/60">
                  Selected: {selectedLogo.originalName}
                  {selectedLogo.mimeType !== 'image/svg+xml' && (
                    <span className="text-warning ml-2">
                      ⚠️ Not SVG format
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          <Textarea
            label="Site Description"
            placeholder="Enter site description"
            value={settings.siteDescription}
            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
        </CardBody>
      </Card>

      {/* Presale Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Presale Settings</h2>
              <p className="text-sm text-foreground/60">Configure presale timing and status</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Presale Active</h3>
              <p className="text-xs text-foreground/60">Enable or disable presale functionality</p>
            </div>
            <Switch
              isSelected={settings.presaleActive}
              onValueChange={(value) => handleInputChange('presaleActive', value)}
              color="success"
            />
          </div>
          
          <Divider />
          
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Presale End Date & Time (UTC)"
              type="datetime-local"
              value={settings.presaleEndDateTime ? new Date(settings.presaleEndDateTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  // Create UTC date from the input value without timezone conversion
                  const [datePart, timePart] = value.split('T')
                  const [year, month, day] = datePart.split('-').map(Number)
                  const [hours, minutes] = timePart.split(':').map(Number)
                  
                  // Create date in UTC
                  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes))
                  handleInputChange('presaleEndDateTime', utcDate.toISOString())
                } else {
                  handleInputChange('presaleEndDateTime', '')
                }
              }}
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70",
              }}
              description="Set the date and time when the presale should end (in UTC timezone)"
            />
          </div>
          
          {settings.presaleActive && (
            <div className="flex items-center gap-2">
              <Chip color="success" variant="flat" size="sm">
                Presale Active
              </Chip>
              <span className="text-sm text-foreground/60">
                Ends: {settings.presaleEndDateTime ? new Date(settings.presaleEndDateTime).toLocaleString('en-US', { 
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                }) : 'Not set'}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Exchange Rates</h2>
              <p className="text-sm text-foreground/60">Configure cryptocurrency exchange rates</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Current Rates Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USDT Rate Card */}
            <div className="relative p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm flex items-center justify-center">$</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">USDT Rate</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Tether to Coin</p>
                  </div>
                </div>
                <Chip 
                  color="primary" 
                  variant="flat" 
                  size="sm"
                  className="font-mono"
                >
                  {parseFloat(settings.usdtToCoinRate.toString())}
                </Chip>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  1 USDT = {parseFloat(settings.usdtToCoinRate.toString())} Coins
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  {settings.usdtToCoinRate > 0 ? `1 Coin = ${parseFloat((1 / settings.usdtToCoinRate).toString())} USDT` : 'Rate not set'}
                </div>
              </div>
            </div>

            {/* SOL Rate Card */}
            <div className="relative p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm flex items-center justify-center pb-[0.27rem]">◎</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">SOL Rate</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-300">Solana to Coin</p>
                  </div>
                </div>
                <Chip 
                  color="secondary" 
                  variant="flat" 
                  size="sm"
                  className="font-mono"
                >
                  {parseFloat(settings.solToCoinRate.toString())}
                </Chip>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  1 SOL = {parseFloat(settings.solToCoinRate.toString())} Coins
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  {settings.solToCoinRate > 0 ? `1 Coin = ${parseFloat((1 / settings.solToCoinRate).toString())} SOL` : 'Rate not set'}
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Rate Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configure Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs leading-none">$</span>
                  </div>
                  <label className="text-sm font-medium text-foreground">USDT to Coin Rate</label>
                </div>
                <Input
                  placeholder="0"
                  type="number"
                  step="any"
                  min="0"
                  value={settings.usdtToCoinRate === 0 ? '' : settings.usdtToCoinRate.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || value === '.') {
                      handleInputChange('usdtToCoinRate', 0)
                    } else {
                      const numValue = parseFloat(value)
                      if (!isNaN(numValue)) {
                        handleInputChange('usdtToCoinRate', numValue)
                      }
                    }
                  }}
                  startContent={
                    <div className="flex items-center justify-center">
                      <span className="text-foreground/60 leading-none">$</span>
                    </div>
                  }
                  endContent={
                    <span className="text-foreground/60 text-sm">coins</span>
                  }
                  classNames={{
                    input: "text-foreground font-mono",
                    inputWrapper: "border-blue-200 dark:border-blue-700 items-center",
                  }}
                  description="How many coins user gets for 1 USDT"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs leading-none pl-[0.05rem] pb-[0.1rem]">◎</span>
                  </div>
                  <label className="text-sm font-medium text-foreground">SOL to Coin Rate</label>
                </div>
                <Input
                  placeholder="0"
                  type="number"
                  step="any"
                  className='leading-[1em]'
                  min="0"
                  value={settings.solToCoinRate === 0 ? '' : settings.solToCoinRate.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || value === '.') {
                      handleInputChange('solToCoinRate', 0)
                    } else {
                      const numValue = parseFloat(value)
                      if (!isNaN(numValue)) {
                        handleInputChange('solToCoinRate', numValue)
                      }
                    }
                  }}
                  startContent={
                    <div className="flex items-center justify-center">
                      <span className="text-foreground/60 text-lg font-semibold pb-[0.4rem]">◎</span>
                    </div>
                  }
                  endContent={
                    <span className="text-foreground/60 text-sm">coins</span>
                  }
                  classNames={{
                    input: "text-foreground font-mono",
                    inputWrapper: "border-purple-200 dark:border-purple-700 items-center",
                  }}
                  description="How many coins user gets for 1 SOL"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Coin Presale Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Coin Settings</h2>
              <p className="text-sm text-foreground/60">Configure token presale parameters</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Coin Name"
            placeholder="Enter coin name"
            value={presaleSettings.name}
            onChange={(e) => handlePresaleChange('name', e.target.value)}
            description="Name of the cryptocurrency token"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
          
          <Input
            label="Mint Address"
            placeholder="Enter Solana mint address"
            value={presaleSettings.mintAddress || ''}
            onChange={(e) => handlePresaleChange('mintAddress', e.target.value)}
            description="Solana token mint address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Total Token Amount"
              placeholder="1000000"
              type="number"
              value={presaleSettings.totalAmount.toString()}
              onChange={(e) => handlePresaleChange('totalAmount', parseFloat(e.target.value) || 0)}
              description="Total number of tokens available for presale"
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70",
              }}
            />
            
            <Input
              label="Decimals"
              placeholder="6"
              type="number"
              min="0"
              max="18"
              value={presaleSettings.decimals.toString()}
              onChange={(e) => handlePresaleChange('decimals', parseInt(e.target.value) || 6)}
              description="Number of decimal places for the token"
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70",
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Buy Amount"
              placeholder="100"
              type="number"
              min="0"
              step="0.000001"
              value={presaleSettings.minBuyAmount.toString()}
              onChange={(e) => handlePresaleChange('minBuyAmount', parseFloat(e.target.value) || 0)}
              description="Minimum amount users can buy"
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70",
              }}
            />
            
            <Input
              label="Maximum Buy Amount"
              placeholder="1000000"
              type="number"
              min="0"
              step="0.000001"
              value={presaleSettings.maxBuyAmount.toString()}
              onChange={(e) => handlePresaleChange('maxBuyAmount', parseFloat(e.target.value) || 1000000)}
              description="Maximum amount users can buy"
              classNames={{
                input: "text-foreground",
                label: "text-foreground/70",
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Stage"
              placeholder="Select stage"
              selectedKeys={[presaleSettings.stage.toString()]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string
                handlePresaleChange('stage', parseInt(selectedKey) || 1)
              }}
              classNames={{
                trigger: "text-foreground dark",
                label: "text-foreground/70 dark",
                base: "dark",
                description: 'dark',
                listbox: 'dark',
                popoverContent: 'dark',
              }}
            >
              {availableStages.map((stage) => (
                <SelectItem className='text-white' key={stage.toString()} textValue={stage.toString()}>
                  Stage {stage}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          
          <div className="flex items-center gap-2">
            <Chip color="primary" variant="flat" size="sm">
              Status: {presaleSettings.status}
            </Chip>
            <span className="text-sm text-foreground/60">
              Stage {presaleSettings.stage} • {presaleSettings.totalAmount.toLocaleString()} total tokens
            </span>
          </div>

          <Divider />

          {/* Vault Root Wallet Management */}
          <RootWalletManagement
            vaultStatus={vaultStatus}
            walletInfo={walletInfo}
            onVaultRefresh={checkVaultStatus}
            onInitialize={onOpen}
            onUpdate={onOpen}
            onDelete={onDeleteOpen}
            loading={vaultLoading}
          />
        </CardBody>
      </Card>

      {/* Initialize/Update Modal */}
      <Modal classNames={{
        base: "dark",
        header: "dark",
        body: "dark",
        footer: "dark",
        backdrop: "dark",
        closeButton: "dark",
        wrapper: "dark",
      }} isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="dark text-white">
                {walletInfo.isInitialized ? 'Update Root Wallet' : 'Initialize Root Wallet'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  
                  <Textarea
                    label="Secret Key"
                    placeholder="Enter the secret key for the root wallet..."
                    value={newSecretKey}
                    onValueChange={setNewSecretKey}
                    minRows={3}
                    maxRows={6}
                  />
                  
                  {!walletInfo.isInitialized && (
                    <div className="flex items-center gap-3">
                      <Switch
                        isSelected={forceInitialize}
                        onValueChange={setForceInitialize}
                        color="warning"
                        size="sm"
                      />
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-medium text-white">Force Initialize</p>
                        <p className="text-xs text-foreground/60">
                          Overwrite existing wallet if it exists
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleModalClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={walletInfo.isInitialized ? updateWallet : initializeWallet}
                  isLoading={vaultLoading}
                >
                  {walletInfo.isInitialized ? 'Update' : 'Initialize'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} classNames={{
        base: "dark",
        header: "dark",
        body: "dark",
        footer: "dark",
        backdrop: "dark",
        closeButton: "dark",
        wrapper: "dark",
      }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="dark text-white">Delete Root Wallet</ModalHeader>
              <ModalBody>
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="text-sm text-danger-800">
                    <p className="font-medium">Warning:</p>
                    <p>This action will permanently delete the root wallet from Vault. 
                    This cannot be undone and will break coin distribution functionality.</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={deleteWallet}
                  isLoading={vaultLoading}
                >
                  Delete Wallet
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  )
}

export { Settings }