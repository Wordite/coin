import { useWalletStore } from '@/app/store/walletStore'
import { AddCoinsToInput } from '@/features/AddCoinsToInput/AddCoinsToInput'
import { useWatch, type Control } from 'react-hook-form'

interface PayInputInfoProps {
  control: Control<any>
}

const PayInputInfo = ({ control }: PayInputInfoProps) => {
  const { balance } = useWalletStore()
  const payCoin = useWatch({ control, name: 'payCoin' })

  const getBalance = () => {
    if (payCoin === 'SOL') {
      return { amount: balance.sol, currency: 'SOL' }
    } else {
      return { amount: balance.usdt, currency: 'USDT' }
    }
  }

  const { amount, currency } = getBalance()

  return (
    <div className='flex justify-between text-[.875rem] max-md:text-[1.24rem] mt-[.688rem] max-md:mt-[.96rem]'>
      <p className='text-white-transparent-75'>
        Available: <span className='text-purple-600'>{amount} {currency}</span>
      </p>

      <AddCoinsToInput control={control} />
    </div>
  )
}

export { PayInputInfo }
