import { useState, useEffect } from 'react'
import { brandingApi, type BrandingData } from '@/services/brandingApi'

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await brandingApi.getLogo()
        setBranding(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load branding')
        console.error('Failed to load branding:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [])

  return { 
    branding, 
    loading, 
    error,
    getImageUrl: brandingApi.getImageUrl 
  }
}