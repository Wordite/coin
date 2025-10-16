export interface SettingsData {
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

export interface RootWalletInfo {
  isInitialized: boolean
  updatedAt?: string
}

export interface VaultStatus {
  isConnected: boolean
  error?: string
}

export interface WalletModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  walletInfo: RootWalletInfo
  newSecretKey: string
  setNewSecretKey: (key: string) => void
  forceInitialize: boolean
  setForceInitialize: (force: boolean) => void
  onInitialize: () => void
  onUpdate: () => void
  loading: boolean
}

export interface DeleteWalletModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  loading: boolean
}

export interface SiteSettingsSectionProps {
  settings: SettingsData
  setSettings: (settings: SettingsData) => void
  selectedLogo: any
  setSelectedLogo: (logo: any) => void
  mediaFiles: any[]
}

export interface PresaleSettingsSectionProps {
  settings: SettingsData
  setSettings: (settings: SettingsData) => void
  presaleSettings: any
  setPresaleSettings: (settings: any) => void
  availableStages: number[]
  setAvailableStages: (stages: number[]) => void
}

export interface ExchangeRatesSectionProps {
  settings: SettingsData
  setSettings: (settings: SettingsData) => void
}
