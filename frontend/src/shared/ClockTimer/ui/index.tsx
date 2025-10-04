import ClockIcon from '@/assets/icons/clock.svg'

const UI = ({ time }: { time: string }) => {
  return (
    <div className='flex items-center max-md:text-[1.32rem] gap-[0.5rem] max-md:gap-[0.69rem] p-[0.5rem] max-md:p-[0.69rem] py-[0.25rem] max-md:py-[0.33rem] rounded-sm bg-gray-transparent-70 border-1 border-stroke-dark'>
      <div className='w-[1rem] h-[1rem] opacity-75 max-md:w-[1.32rem] max-md:h-[1.32rem]'>
        <ClockIcon className='' />
      </div>
      <p className='font-semibold text-[.875rem] max-md:text-[1.32rem] text-white-transparent-75'>{time}</p>
    </div>
  )
}

export { UI }
