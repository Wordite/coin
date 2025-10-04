import { useCallback, useEffect, useLayoutEffect } from 'react'
import { useRem } from '@/hooks/useRem'

export function useHeaderScrollWatcher() {
  const { rem } = useRem()

  const updateHeaderProgress = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    const progress = Math.min(docHeight > 0 ? scrollTop / rem(5) : 0, 1)

    document.querySelector('header')?.style.setProperty('--progress', progress.toString())
    document.querySelector('.nested-links')?.style.setProperty('--progress', progress.toString())
  }, [rem])

  useEffect(() => {
    window.addEventListener('scroll', updateHeaderProgress)
    window.addEventListener('resize', updateHeaderProgress)
    window.addEventListener('load', updateHeaderProgress)

    updateHeaderProgress()

    return () => {
      window.removeEventListener('scroll', updateHeaderProgress)
      window.removeEventListener('resize', updateHeaderProgress)
      window.removeEventListener('load', updateHeaderProgress)
    }
  }, [updateHeaderProgress])
}
