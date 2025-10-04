import { useFormContext } from 'react-hook-form'
import { type PurchaseFormData } from '@/app/validation'
import { useCallback, useMemo } from 'react'
import { useSettings } from '@/hooks'
import { PayCoin } from '@/constants/payCoin'
import { usePresaleSettings } from '@/hooks/usePresaleSettings'
import { calculateReceive } from '@/shared/utils/formatNumber'

const useCalculatedReceive = () => {
  const { watch } = useFormContext<PurchaseFormData>()
  const payCoin = watch('payCoin')
  const pay = watch('pay')
  const { settings } = useSettings()
  const { presaleSettings } = usePresaleSettings()

  const getReceive = useCallback(() => {
    if (!settings || !presaleSettings) return 0

    const payAmount = Number(pay) || 0
    const decimals = presaleSettings.decimals || 6
    const maxBuyAmount = presaleSettings.maxBuyAmount

    let calculatedReceive = 0

    if (payCoin === PayCoin.SOL) {
      calculatedReceive = calculateReceive(payAmount, settings.solToCoinRate, decimals)
    } else if (payCoin === PayCoin.USDT) {
      calculatedReceive = calculateReceive(payAmount, settings.usdtToCoinRate, decimals)
    }

    return Math.min(calculatedReceive, maxBuyAmount)
  }, [payCoin, pay, settings, presaleSettings])

  const receive = useMemo(() => getReceive(), [getReceive])

  return {
    receive,
  }
}

export { useCalculatedReceive }
