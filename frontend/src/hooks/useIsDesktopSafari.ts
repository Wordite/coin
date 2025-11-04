import { useEffect, useMemo, useState } from 'react'

/**
 * Detects Desktop Safari browser on client. Returns false on server, mobile Safari, or other browsers.
 */
export function useIsDesktopSafari(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isDesktopSafari = useMemo(() => {
    if (!isClient || typeof navigator === 'undefined') return false
    try {
      const ua = navigator.userAgent || ''
      // Safari detection: must contain Safari but NOT Chrome, Edge, or Firefox
      const isSafariUA = /safari/i.test(ua) && 
                        !/chrome/i.test(ua) && 
                        !/crios/i.test(ua) && // Chrome on iOS
                        !/fxios/i.test(ua) && // Firefox on iOS
                        !/edg/i.test(ua) &&   // Edge
                        !/opr/i.test(ua)      // Opera
      
      // Desktop detection: NOT mobile/tablet
      const isMobile = /iphone|ipad|ipod|mobile/i.test(ua)
      
      return isSafariUA && !isMobile
    } catch {
      return false
    }
  }, [isClient])

  return isDesktopSafari
}

