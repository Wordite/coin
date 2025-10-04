import { useEffect, useCallback, useRef } from 'react'

export function useLinkCoordsWatcher(targetLabel: string) {
  const lastCoords = useRef({ x: 0, y: 0 })

  const updateLinkCoords = useCallback(() => {
    const linkElement = Array.from(
      document.querySelectorAll('nav a, .header a, .header p span')
    ).find((el) => el.textContent?.trim() === targetLabel)

    if (linkElement) {
      const rect = linkElement.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height

      const nestedLinks = document.querySelector<HTMLElement>('.nested-links')
      if (nestedLinks) {
        if (lastCoords.current.x !== x || lastCoords.current.y !== y) {
          lastCoords.current = { x, y }
          nestedLinks.style.setProperty('--x', `${x}px`)
          nestedLinks.style.setProperty('--y', `${y}px`)
        }
      }
    }
  }, [targetLabel])

  useEffect(() => {
    window.addEventListener('scroll', updateLinkCoords, { passive: true })
    window.addEventListener('resize', updateLinkCoords, { passive: true })
    window.addEventListener('load', updateLinkCoords)

    const observer = new MutationObserver(updateLinkCoords)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    updateLinkCoords()

    return () => {
      window.removeEventListener('scroll', updateLinkCoords)
      window.removeEventListener('resize', updateLinkCoords)
      window.removeEventListener('load', updateLinkCoords)
      observer.disconnect()
    }
  }, [updateLinkCoords])
}
