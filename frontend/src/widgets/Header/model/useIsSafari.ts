import { useEffect, useMemo, useState } from 'react'

/**
 * Detects Safari browser on client. Returns false on server.
 * Uses UA heuristic similar to: /^((?!chrome|android).)*safari/i
 */
export function useIsSafari(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isSafari = useMemo(() => {
    if (!isClient || typeof navigator === 'undefined') return false
    try {
      const ua = navigator.userAgent || ''
      // More precise Safari detection: must contain Safari but NOT Chrome, Edge, or Firefox
      const isSafariUA = /safari/i.test(ua) && 
                        !/chrome/i.test(ua) && 
                        !/crios/i.test(ua) && // Chrome on iOS
                        !/fxios/i.test(ua) && // Firefox on iOS
                        !/edg/i.test(ua) &&   // Edge
                        !/opr/i.test(ua)      // Opera
      

      return isSafariUA
    } catch {
      return false
    }
  }, [isClient])

  return isSafari
}


