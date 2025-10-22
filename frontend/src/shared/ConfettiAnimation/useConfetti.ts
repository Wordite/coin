import { useState, useCallback } from 'react'

export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false)

  const triggerConfetti = useCallback(() => {
    setIsActive(true)
  }, [])

  const stopConfetti = useCallback(() => {
    setIsActive(false)
  }, [])

  const onComplete = useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive,
    triggerConfetti,
    stopConfetti,
    onComplete
  }
}
