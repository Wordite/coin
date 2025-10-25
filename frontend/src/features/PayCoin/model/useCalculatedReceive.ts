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
  const receive = watch('receive')
  const { settings } = useSettings()
  const { presaleSettings } = usePresaleSettings()
  
  const [serverReceive, setServerReceive] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxPayAmount, setMaxPayAmount] = useState<number>(0)

  // Calculate maximum pay amount based on available balance
  const calculateMaxPayAmount = useCallback(() => {
    if (!settings || !presaleSettings) return 0
    
    const currentAmount = presaleSettings.total - presaleSettings.sold
    if (currentAmount <= 0) return 0
    
    const rate = payCoin === 'SOL' ? settings.solToCoinRate : settings.usdtToCoinRate
    const maxReceive = Math.min(currentAmount, presaleSettings.maxBuyAmount)
    const maxPay = maxReceive / rate
    
    setMaxPayAmount(maxPay)
    return maxPay
  }, [settings, presaleSettings, payCoin])

  // Debounced function to call API
  const fetchReceiveFromServer = useCallback(async (amount: number, coin: string) => {
    if (!amount || amount <= 0) {
      setServerReceive(0)
      setValue('receive', 0)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/coin/public/receive', {
        params: {
          amount,
          coin
        }
      })
      
      const serverReceiveValue = response.data.receive || 0
      setServerReceive(serverReceiveValue)
      setValue('receive', serverReceiveValue)
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
        setServerReceive(fallbackReceive)
        setValue('receive', fallbackReceive)
      }
    } finally {
      setIsLoading(false)
    }
  }, [settings, presaleSettings, setValue])

  // Calculate max pay amount when dependencies change
  useEffect(() => {
    calculateMaxPayAmount()
  }, [calculateMaxPayAmount])

  // Debounced effect to call API when pay amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pay && payCoin) {
        fetchReceiveFromServer(Number(pay), payCoin)
      } else {
        setServerReceive(0)
        setValue('receive', 0)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [pay, payCoin, fetchReceiveFromServer, setValue])

  // Auto-adjust pay amount when receive exceeds available
  useEffect(() => {
    if (receive && presaleSettings && settings) {
      const currentAmount = presaleSettings.total - presaleSettings.sold
      const maxReceive = Math.min(currentAmount, presaleSettings.maxBuyAmount)
      
      if (receive > maxReceive) {
        const rate = payCoin === 'SOL' ? settings.solToCoinRate : settings.usdtToCoinRate
        const adjustedPay = maxReceive / rate
        setValue('pay', adjustedPay)
      }
    }
  }, [receive, presaleSettings, settings, payCoin, setValue])

  return {
    receive: serverReceive,
    isLoading,
    error,
    maxPayAmount,
    setMaxPay: () => setValue('pay', maxPayAmount),
  }
}

export { useCalculatedReceive }
