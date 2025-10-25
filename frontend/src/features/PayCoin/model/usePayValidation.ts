import { useFormContext } from 'react-hook-form'
import { useCallback, useEffect } from 'react'
import { useWalletStore } from '@/app/store/walletStore'
import { useToastContext } from '@/shared/Toast'
import { type PurchaseFormData } from '@/app/validation'

const usePayValidation = () => {
  const { watch, setValue } = useFormContext<PurchaseFormData>()
  const { balance } = useWalletStore()
  const { showInfo } = useToastContext()
  
  const payCoin = watch('payCoin')
  const pay = watch('pay')

  const getMaxBalance = useCallback(() => {
    return payCoin === 'SOL' ? balance.sol : balance.usdt
  }, [payCoin, balance])

  const validatePayAmount = useCallback((amount: number) => {
    const maxBalance = getMaxBalance()
    
    if (amount > maxBalance) {
      setValue('pay', maxBalance.toString())
      showInfo(`Maximum available: ${maxBalance} ${payCoin}`)
      return false
    }
    
    return true
  }, [getMaxBalance, setValue, showInfo, payCoin])

  // Validate when pay amount changes
  useEffect(() => {
    if (pay && Number(pay) > 0) {
      validatePayAmount(Number(pay))
    }
  }, [pay, validatePayAmount])

  return {
    validatePayAmount,
    getMaxBalance
  }
}

export { usePayValidation }
