import Button from '@/shared/Button'
import { ClockTimer } from '@/shared/ClockTimer'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import PayCoinSelector from '@/features/PayCoinSelector/PayCoinSelector'
import { PayCoinInput } from '@/features/PayCoin/PayCoinInput'
import { PresaleProgess } from '@/entities/PresaleProgress/PresaleProgess'
import { PayInputInfo } from '@/features/PayInputInfo/PayInputInfo'
import { purchaseFormSchema, createPurchaseFormSchema, type PurchaseFormData } from '@/app/validation'
import { useToastContext } from '@/shared/Toast'
import { useWalletStore } from '@/app/store/walletStore'
import { PresaleEnded } from './ui/PresaleEnded'
import { PurchaseCoinsSkeleton } from './ui/PurchaseCoinsSkeleton'
import { useSettings, useSectionData, usePurchaseCoins } from '@/hooks'
import { usePresaleSettings } from '@/hooks/usePresaleSettings'
import { PayCoinReceive } from '@/features/PayCoin/PayCoinReceive'
import { useReceiverPublicKey } from '@/hooks/useReceiverPublicKey'

const PurchaseCoins = () => {
  const { showError } = useToastContext()
  const { isConnected, balance } = useWalletStore()
  const { settings, isLoading: isSettingsLoaing, error: settingsError } = useSettings()
  const {
    presaleSettings,
    isLoading: isPresaleSettingsLoading,
    error: presaleSettingsError,
  } = usePresaleSettings()
  const { purchaseCoins, isPurchasing } = usePurchaseCoins()

  const methods = useForm<PurchaseFormData>({
    resolver: yupResolver(
      presaleSettings 
        ? createPurchaseFormSchema(presaleSettings.minBuyAmount, presaleSettings.maxBuyAmount)
        : purchaseFormSchema
    ),
    defaultValues: {
      payCoin: 'SOL',
      pay: undefined,
      receive: undefined,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods

  const payCoin = useWatch({ control, name: 'payCoin' })
  const { data, isLoading: isPurchaseCoinsLoading, error: purchaseCoinsError } = useSectionData('PurchaseCoins')
  const { receiverPublicKey, isLoading: isReceiverPublicKeyLoading, error: receiverPublicKeyError } = useReceiverPublicKey()

  const onSubmit = async (data: PurchaseFormData) => {
    if (!isConnected) return showError('Please connect your wallet')
    const currentBalance = payCoin === 'SOL' ? balance.sol : balance.usdt
    if (currentBalance <= 0) return showError(`You don't have this currency`)
    if (data.pay > currentBalance) return showError(`You don't have enough ${payCoin}`)

    try {
      console.log('Purchase form data:', data)  
      const payAmount = data.pay
      
      const signature = await purchaseCoins({
        toPublicKey: receiverPublicKey,
        amount: payAmount,
        currency: data.payCoin as 'SOL' | 'USDT'
      })

      if (signature) {
        reset()
        console.log('Purchase completed with signature:', signature)
      }
    } catch (error) {
      console.error('Error purchasing coins:', error)
      showError('Error purchasing coins. Please try again.')
    }
  }

  if (
    isSettingsLoaing ||
    isPresaleSettingsLoading ||
    isPurchaseCoinsLoading ||
    settingsError ||
    presaleSettingsError ||
    purchaseCoinsError ||
    isReceiverPublicKeyLoading ||
    receiverPublicKeyError ||
    !receiverPublicKey ||
    !settings ||
    !presaleSettings
  )
    return <PurchaseCoinsSkeleton />

  if (!settings?.presaleActive) return <PresaleEnded />

  return (
    <div className='w-[30.188rem] h-[44rem] max-md:h-[64rem] max-md:mt-[3.5rem] max-md:w-full flex flex-col bg-[var(--color-gray-transparent-10)] backdrop-blur-3xl rounded-xl p-[1.625rem]'>
      <div className='flex items-center justify-between'>
        <p className='font-semibold text-[1.375rem] max-md:text-[1.76rem]'>{data.widgetTitle}</p>
        <ClockTimer time={settings?.presaleEndTime} />
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit as any)} className='flex flex-col flex-1 max-md:mt-[2.2rem]'>
          <PayCoinSelector register={register as any} control={control as any} />

          <PayCoinInput
            register={register}
            name='pay'
            placeholder={`0 ${payCoin}`.toUpperCase()}
            title='You pay'
            error={errors.pay}
          />
          <PayInputInfo control={control} />

          <PayCoinReceive
            register={register}
            name='receive'
            disabled
            placeholder={`0 ${presaleSettings.name}`.toUpperCase()}
            title='Receive'
            error={errors.receive}
          />

          <PresaleProgess />

          <Button
            type='submit'
            color='green'
            isLoading={isSubmitting || isPurchasing}
            loadingText='Purchasing...'
            className='clickable w-full h-[3.64rem] max-md:h-[4.62rem] mt-auto disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Purchase
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

export { PurchaseCoins }
