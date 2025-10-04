
const PurchaseCoinsSkeleton = () => {
  return (
    <div className='w-[30.188rem] h-[44rem] max-md:h-[64rem] max-md:mt-[3.5rem] max-md:w-full flex flex-col bg-[var(--color-gray-transparent-10)] backdrop-blur-3xl rounded-xl p-[1.625rem]'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='h-[1.375rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.76rem]' />
        <div className='h-[2rem] w-[6rem] bg-gray-300 rounded animate-pulse' />
      </div>

      {/* Form */}
      <div className='flex flex-col flex-1 max-md:mt-[2.2rem]'>
        {/* PayCoinSelector */}
        <div className='mt-[1.5rem]'>
          <div className='h-[3rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[3.96rem]' />
        </div>

        {/* PayCoinInput - You pay */}
        <div className='mt-[2.063rem] max-md:mt-[2.75rem]'>
          <div className='h-[1.25rem] w-[4rem] bg-gray-300 rounded animate-pulse max-md:h-[1.76rem] mb-[.688rem] max-md:mb-[.96rem]' />
          <div className='h-[3.375rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[5.08rem]' />
        </div>

        {/* PayInputInfo */}
        <div className='mt-[.688rem] max-md:mt-[.96rem]'>
          <div className='h-[.875rem] w-[12rem] bg-gray-300 rounded animate-pulse max-md:h-[1.24rem]' />
        </div>

        {/* PayCoinInput - Receive */}
        <div className='mt-[2.063rem] max-md:mt-[2.75rem]'>
          <div className='h-[1.25rem] w-[4rem] bg-gray-300 rounded animate-pulse max-md:h-[1.76rem] mb-[.688rem] max-md:mb-[.96rem]' />
          <div className='h-[3.375rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[5.08rem]' />
        </div>

        {/* PresaleProgress */}
        <div className='mt-[1.75rem] max-md:mt-[2.34rem]'>
          {/* Progress header */}
          <div className='mb-[0.5rem] max-md:mb-[0.69rem] flex justify-between items-center'>
            <div className='h-[.875rem] w-[8rem] bg-gray-300 rounded animate-pulse max-md:h-[1.24rem]' />
            <div className='h-[.875rem] w-[6rem] bg-gray-300 rounded animate-pulse max-md:h-[1.24rem]' />
          </div>
          
          {/* Progress bar */}
          <div className='h-[1.063rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[1.43rem]' />
          
          {/* Info cards */}
          <div className='mt-[1.25rem] max-md:mt-[1.65rem] flex justify-between gap-[1rem] max-md:gap-[1.375rem]'>
            <div className='w-[13.063rem] h-[1.938rem] bg-gray-300 rounded animate-pulse max-md:w-[17.6rem] max-md:h-[2.61rem]' />
            <div className='w-[13.063rem] h-[1.938rem] bg-gray-300 rounded animate-pulse max-md:w-[17.6rem] max-md:h-[2.61rem]' />
          </div>
        </div>

        {/* Purchase Button */}
        <div className='mt-auto'>
          <div className='h-[3.64rem] w-full bg-gray-300 rounded animate-pulse max-md:h-[4.62rem]' />
        </div>
      </div>
    </div>
  )
}

export { PurchaseCoinsSkeleton }