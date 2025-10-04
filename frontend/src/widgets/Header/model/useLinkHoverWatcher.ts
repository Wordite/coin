import { useState, useEffect, useRef, useCallback } from 'react'

export function useLinkHoverWatcher(targetLabel: string, gap: number = 16) {
  const [isHovered, setIsHovered] = useState(false)
  const rafId = useRef<number | null>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const lastHoverState = useRef(false)

  const updateHover = useCallback(() => {
    const { x, y } = mousePos.current
    const rects: DOMRect[] = []

    const linkEl = Array.from(
      document.querySelectorAll<HTMLElement>('nav a, .header a, .header p span')
    ).find((el) => el.textContent?.trim() === targetLabel)

    const menuEl = document.querySelector<HTMLElement>('.nested-links')

    if (linkEl) {
      const linkRect = linkEl.getBoundingClientRect()
      rects.push(linkRect)
      rects.push(new DOMRect(linkRect.left, linkRect.bottom, linkRect.width, gap))
    }

    if (menuEl) {
      rects.push(menuEl.getBoundingClientRect())
    }

    const inside = rects.some(
      (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    )
  
    if (lastHoverState.current !== inside) {
      lastHoverState.current = inside
      setIsHovered(inside)
    }
  }, [targetLabel, gap])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY }
    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(updateHover)
  }, [updateHover])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [handleMouseMove])

  return isHovered
}
