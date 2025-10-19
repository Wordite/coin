import { useEffect, useState } from 'react'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 769)
    }

    let timeoutId: NodeJS.Timeout
    const debouncedCheckIsMobile = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkIsMobile, 100)
    }

    checkIsMobile()
    window.addEventListener('resize', debouncedCheckIsMobile)

    return () => {
      window.removeEventListener('resize', debouncedCheckIsMobile)
      clearTimeout(timeoutId)
    }
  }, [])

  return isMobile
}

export { useIsMobile }
