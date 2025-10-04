import { useState, useEffect, useMemo } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UseStageTimerProps {
  endDate: Date
}

export const useStageTimer = ({ endDate }: UseStageTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Мемоизируем timestamp чтобы избежать бесконечных перерендеров
  const endTimestamp = useMemo(() => endDate.getTime(), [endDate])

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTimestamp - Date.now())
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTimestamp])

  return timeLeft
}