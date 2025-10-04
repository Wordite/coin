export interface SettingsData {
  // Site Settings
  siteName: string
  siteLogo: string
  siteDescription: string
  
  // Presale Settings
  presaleEndDate: string
  presaleEndTime: number
  
  // Exchange Rates
  usdtToCoinRate: number
  solToCoinRate: number
}