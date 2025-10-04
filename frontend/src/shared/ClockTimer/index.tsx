import { memo } from 'react'
import { UI } from './ui'
import type { ClockTimerProps } from './types'
import { useTimer } from './model/useTime'

const ClockTimerComponent = ({ time }: ClockTimerProps) => {
  const readableTime = useTimer(time)
  return <UI time={readableTime} />
}

const ClockTimer = memo(ClockTimerComponent)

export { ClockTimer }
