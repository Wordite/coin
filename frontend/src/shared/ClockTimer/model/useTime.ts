import { useEffect, useState } from 'react'

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '0d 0h 0m'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return `${days}d ${hours}h ${minutes}m`
}

const useTimer = (seconds: number): string => {
  const [formatted, setFormatted] = useState(() => formatTime(seconds))

  useEffect(() => {
    const update = () => {
      setFormatted(formatTime(seconds))
    }

    update()

    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [seconds])

  return formatted
}

export { useTimer }
