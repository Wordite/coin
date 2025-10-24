import { useStageTimer } from '@/hooks/useStageTimer'
import { Stage } from './ui/Stage'

interface StageTimerProps {
  endDate: number
  title?: string
  timezone?: string
}

const StageTimer = ({ endDate, title = 'Presale ends in', timezone = 'UTC' }: StageTimerProps) => {
  const timeLeft = useStageTimer({ endDate: new Date(endDate) })

  return (
    <div className='mt-[2rem] p-[1.188rem] rounded-xxl bg-gray-transparent-10 border-1 border-stroke-light'>
      <div className='flex items-center justify-between'>
        <p className='text-[1rem] font-semibold max-md:text-[1.875rem]'>{title}</p>
        <p className='text-[.875rem] text-white-transparent-75 max-md:text-[1.375rem]'>{timezone}</p>
      </div>
      <div className='grid grid-cols-4 gap-[.75rem] mt-[.9rem] max-md:grid-cols-2'>
        <Stage value={timeLeft.days} label='Days' />
        <Stage value={timeLeft.hours} label='Hours' />
        <Stage value={timeLeft.minutes} label='Minutes' />
        <Stage value={timeLeft.seconds} label='Seconds' />
      </div>
    </div>
  )
}

export { StageTimer }
