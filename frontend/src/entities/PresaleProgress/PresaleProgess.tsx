import StageIcon from '@/assets/icons/stage.svg'
import PriceIcon from '@/assets/icons/price.svg'
import { usePresaleSettings } from '@/hooks/usePresaleSettings'
import { useSettings } from '@/hooks'
import { useFormContext } from 'react-hook-form'
import { type PurchaseFormData } from '@/app/validation'
import { PayCoin } from '@/constants/payCoin'

const PresaleProgess = () => {
  const { presaleSettings } = usePresaleSettings()
  const { settings } = useSettings()
  const { watch } = useFormContext<PurchaseFormData>()
  const payCoin = watch('payCoin')

  return (
    <div className='mt-[1.75rem] max-md:mt-[2.34rem]'>
      <div className='mb-[0.5rem] max-md:mb-[0.69rem] flex justify-between items-center text-[.875rem] max-md:text-[1.24rem] text-white-transparent-75'>
        <p className=''>Presale progress</p>
        <p>{presaleSettings!.sold.toLocaleString('en-US')} / {presaleSettings!.total.toLocaleString('en-US')}</p>
      </div>

      <div className='h-[1.063rem] max-md:h-[1.43rem] bg-gray-200 rounded-md'>
        <div className='h-full bg-[image:var(--color-gradient-purple-blue-5)] rounded-md' style={{ width: `${(presaleSettings!.sold / presaleSettings!.total) * 100}%` }} />
      </div>

      <div className='mt-[1.25rem] max-md:mt-[1.65rem] flex justify-between gap-[1rem] max-md:gap-[1.375rem]'>
        <div className='flex items-center gap-[0.8rem] max-md:gap-[1.1rem] px-[0.8rem] max-md:px-[1.1rem] w-[13.063rem] max-md:w-[17.6rem] h-[1.938rem] max-md:h-[2.61rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm'>
          <div className='w-[1.563rem] max-md:w-[2.09rem] h-[.563rem] max-md:h-[.77rem]'>
            <StageIcon className='w-full h-full' />
          </div>
          <p className='text-[.875rem] max-md:text-[1.24rem]'>Current stage: {presaleSettings!.stage}</p>
        </div>

        <div className='flex items-center gap-[0.8rem] max-md:gap-[1.1rem] px-[0.8rem] max-md:px-[1.1rem] w-[13.063rem] max-md:w-[17.6rem] h-[1.938rem] max-md:h-[2.61rem] bg-gray-transparent-70 border-1 border-stroke-dark rounded-sm'>
          <div className='w-[.625rem] max-md:w-[.88rem] h-[1.063rem] max-md:h-[1.43rem]'>
            <PriceIcon className='w-full h-full' />
          </div>
          <p className='text-[.875rem] max-md:text-[1.24rem]'>Price: {payCoin === PayCoin.SOL ? `${1 / settings!.solToCoinRate} SOL` : `${1 / settings!.usdtToCoinRate} USDT`}</p>
        </div>
      </div>
    </div>
  )
}

export { PresaleProgess }
