import { useWatch, type UseFormRegister, type Control, type Path } from 'react-hook-form'
import { PayCoin } from '@/constants/payCoin'

import { InputRadio } from '@/shared/Input'
import { useIsSoldOut } from '@/hooks'

import SolanaIcon from '@/assets/icons/solana.svg'
import USDTIcon from '@/assets/icons/usdt.svg'

interface PayCoinSelectorProps<T extends Record<string, any>> {
  register: UseFormRegister<T>
  control: Control<T>
}

const PayCoinSelector = <T extends Record<string, any>>({
  register,
  control,
}: PayCoinSelectorProps<T>) => {
  const isSoldOut = useIsSoldOut()
  const payCoin = useWatch({ control, name: 'payCoin' as Path<T> })

  return (
    <div className='flex relative rounded-md overflow-hidden max-md:pb-[0.2rem] mt-[1.5rem] clickable h-[3rem] max-md:h-[3.96rem]'>
      <div
        className={`absolute top-0 left-0 w-1/2 h-full -z-10 bg-gray-200 transition-transform ease-out duration-150 ${
          payCoin === PayCoin.SOL ? 'translate-x-0' : 'translate-x-full'
        }`}
      />

      <InputRadio
        disabled={isSoldOut}
        className='w-1/2 rounded-r-none border-r-0 h-full max-md:h-[3.96rem]'
        register={register}
        checked={payCoin === PayCoin.SOL}
        value={PayCoin.SOL}
        name={'payCoin' as Path<T>}
      >
        <div className='w-[1rem] h-[.75rem] max-md:w-[1.485rem] max-md:h-[1.485rem]'>
          <SolanaIcon className='w-full h-full' />
        </div>
        <p className='text-[1.125rem] font-semibold max-md:text-[1.485rem]'>SOL</p>
      </InputRadio>

      <InputRadio
        disabled={isSoldOut}
        className='w-1/2 rounded-l-none border-l-0 h-full max-md:h-[3.96rem]'
        register={register}
        checked={payCoin === PayCoin.USDT}
        value={PayCoin.USDT}
        name={'payCoin' as Path<T>}
      >
        <div className='w-[1rem] h-[.875rem] max-md:w-[1.485rem] max-md:h-[1.485rem]'>
          <USDTIcon className='w-full h-full' />
        </div>
        <p className='text-[1.125rem] font-semibold max-md:text-[1.485rem]'>USDT</p>
      </InputRadio>
    </div>
  )
}

export default PayCoinSelector
