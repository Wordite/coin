import { useEffect } from 'react'

export function useCoordsWatcher(targetLabel: string) {
  useEffect(() => {
    const updateHeaderProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      const progress = Math.min(docHeight > 0 ? scrollTop / 80 : 0, 1)

      document.querySelector('header')?.style.setProperty('--progress', progress.toString())
      document.querySelector('.nested-links')?.style.setProperty('--progress', progress.toString())
    }

    window.addEventListener('scroll', updateHeaderProgress)
    window.addEventListener('resize', updateHeaderProgress)
    window.addEventListener('load', updateHeaderProgress)

    updateHeaderProgress()

    return () => {
      window.removeEventListener('scroll', updateHeaderProgress)
      window.removeEventListener('resize', updateHeaderProgress)
      window.removeEventListener('load', updateHeaderProgress)
    }
  }, [])
}
