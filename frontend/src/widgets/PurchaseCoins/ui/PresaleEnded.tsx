import { useSectionData } from '@/hooks'
import Button from '@/shared/Button'

const PresaleEnded = () => {
  const { data } = useSectionData('PurchaseCoins')

  return (
    <div className='relative overflow-hidden w-[30.188rem] h-[35rem] max-md:mt-[3.5rem] max-md:w-full flex flex-col bg-[var(--color-gray-transparent-10)] backdrop-blur-3xl rounded-xl p-[1.625rem]'>
      <div className='pointer-events-none absolute -top-24 -left-24 w-[22rem] h-[22rem] rounded-full opacity-25 blur-3xl [background-image:var(--color-gradient-purple-blue)]' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 w-[22rem] h-[22rem] rounded-full opacity-20 blur-3xl [background-image:var(--color-gradient-purple-blue)]' />


      <div className='flex flex-1 items-center justify-center text-center'>
        <div className='flex flex-col items-center gap-5'>
          <span className='px-2 py-1 rounded-md text-[.75rem] bg-white/5 border border-white/10 text-white/80'>Status: Closed</span>

          <h2 className='text-[1.75rem] font-semibold leading-tight text-transparent bg-clip-text [background-image:var(--color-gradient-purple-blue)]'>
            {data.presaleEndTitle}
          </h2>
          <p className='text-white/70 max-w-[22rem] leading-relaxed'>
            {data.presaleEndText}
          </p>

          <div className='flex flex-col w-full gap-3 mt-2'>
            <Button disabled color='green' className='w-full h-[3.313rem] disabled:opacity-50 disabled:cursor-not-allowed'>
              Presale closed
            </Button>
            <Button isLink to={data.presaleEndButton[0].textField2} color='dark' className='w-full h-[3.313rem]'>
              {data.presaleEndButton[0].textField1}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PresaleEnded }