import type { HTMLAttributes } from 'react'
import { useWatch, useFormContext } from 'react-hook-form'
import { useWalletStore } from '@/app/store/walletStore'
import { useToastContext } from '@/shared/Toast'

interface AddCoinToPayButton extends HTMLAttributes<HTMLButtonElement> {
  value: string
  control: any
}

const AddCoinToPayButton = ({ value, control, ...props }: AddCoinToPayButton) => {
  const { balance, isConnected } = useWalletStore()
  const { showError } = useToastContext()
  const { setValue } = useFormContext()
  
  const payCoin = useWatch({ control, name: 'payCoin' })

  const handleClick = () => {
    if (!isConnected) {
      showError('Please connect your wallet')
      return
    }

    const currentBalance = payCoin === 'SOL' ? balance.sol : balance.usdt
    
    if (currentBalance <= 0) {
      showError(`You don't have this currency`)
      return
    }

    let amountToAdd: number

    if (value === 'MAX') {
      amountToAdd = currentBalance
    } else {
      const multiplier = parseFloat(value)
      amountToAdd = multiplier * currentBalance
      
      if (amountToAdd > currentBalance) {
        showError(`You don't have enough ${payCoin}`)
        return
      }
    }

    const formattedAmount = Math.round(amountToAdd * 1000000) / 1000000
    setValue('pay', formattedAmount.toString())
  }

  return (
    <button
      {...props}
      type="button"
      onClick={handleClick}
      className='clickable w-[2.625rem] max-md:w-[3.52rem] h-[1.625rem] max-md:h-[2.2rem] hover:brightness-120 duration-150 cursor-pointer flex items-center justify-center rounded-sm text-white-transparent-75 bg-gray-transparent-70 border-1 border-stroke-dark text-[.75rem] max-md:text-[1.1rem]'
    >
      <span>{value}</span>
    </button>
  )
}

export { AddCoinToPayButton }
