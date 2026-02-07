import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface Settings {
  siteName: string
  siteLogo: string
  siteDescription: string
  presaleEndTime: number
  presaleActive: boolean
  usdtToCoinRate: number
  solToCoinRate: number
}

function getImageUrl(url: string): string {
  if (!url) return ''
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url}`
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/public`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings')
        return res.json()
      })
      .then(data => {
        setSettings(data)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err)
        setIsLoading(false)
      })
  }, [])

  // Set favicon and document title when settings load
  useEffect(() => {
    if (settings?.siteLogo) {
      const link =
        (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
        document.createElement('link')
      link.type = 'image/svg+xml'
      link.rel = 'shortcut icon'
      link.href = getImageUrl(settings.siteLogo)
      document.getElementsByTagName('head')[0].appendChild(link)
    }

    if (settings?.siteName) {
      document.title = settings.siteName
    }
  }, [settings])

  return { settings, isLoading, error, getImageUrl }
}
