import { useEffect, useState, useCallback } from 'react'

export function useRem() {
  const getRemValue = () => parseFloat(getComputedStyle(document.documentElement).fontSize)
  const [remValue, setRemValue] = useState(getRemValue)

  useEffect(() => {
    const updateRem = () => setRemValue(getRemValue())
    const observer = new ResizeObserver(updateRem)

    observer.observe(document.documentElement)
    window.addEventListener('resize', updateRem)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateRem)
    }
  }, [])

  const rem = useCallback((value: number) => Math.round(value * remValue), [remValue])

  return { rem }
}
