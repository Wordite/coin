import { useFormContext } from 'react-hook-form'
import { type PurchaseFormData } from '@/app/validation'
import { useCallback, useState, useEffect } from 'react'
import { useSettings } from '@/hooks'
import { PayCoin } from '@/constants/payCoin'
import { usePresaleSettings } from '@/hooks/usePresaleSettings'
import { calculateReceive } from '@/shared/utils/formatNumber'
import { api } from '@/app/api'

const useCalculatedReceive = () => {
  const { watch, setValue } = useFormContext<PurchaseFormData>()
  const payCoin = watch('payCoin')
  const pay = watch('pay')
  const { settings } = useSettings()
  const { presaleSettings } = usePresaleSettings()
  
  const [receive, setReceive] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced function to call API
  const fetchReceiveFromServer = useCallback(async (amount: number, coin: string) => {
    if (!amount || amount <= 0) {
      setReceive(0)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/coin/public/receive', {
        amount,
        coin
      })
      
      const serverReceive = response.data.receive || 0
      setReceive(serverReceive)
      setValue('receive', serverReceive)
    } catch (err) {
      console.error('Failed to fetch receive from server:', err)
      setError('Failed to calculate receive amount')
      
      // Fallback to local calculation
      if (settings && presaleSettings) {
        const payAmount = Number(amount) || 0
        const decimals = presaleSettings.decimals || 6
        const maxBuyAmount = presaleSettings.maxBuyAmount
        const totalAmount = presaleSettings.total
        const soldAmount = presaleSettings.sold
        const currentAmount = totalAmount - soldAmount
        let calculatedReceive = 0

        if (coin === PayCoin.SOL) {
          calculatedReceive = calculateReceive(payAmount, settings.solToCoinRate, decimals)
        } else if (coin === PayCoin.USDT) {
          calculatedReceive = calculateReceive(payAmount, settings.usdtToCoinRate, decimals)
        }

        const fallbackReceive = Math.min(calculatedReceive, maxBuyAmount, currentAmount)
        setReceive(fallbackReceive)
        setValue('receive', fallbackReceive)
      }
    } finally {
      setIsLoading(false)
    }
  }, [settings, presaleSettings, setValue])

  // Debounced effect to call API when pay amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pay && payCoin) {
        fetchReceiveFromServer(Number(pay), payCoin)
      } else {
        setReceive(0)
        setValue('receive', 0)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [pay, payCoin, fetchReceiveFromServer, setValue])

  return {
    receive,
    isLoading,
    error,
  }
}

export { useCalculatedReceive }
