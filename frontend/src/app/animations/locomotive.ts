import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/dist/locomotive-scroll.css'

let locomotiveScroll: LocomotiveScroll | null = null

export function initLocomotiveScroll() {
  if (typeof window === 'undefined') return

  const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement
  if (!scrollContainer) return

  locomotiveScroll = new (LocomotiveScroll as any)({
    smooth: true,
    lerp: 1,
    multiplier: 0.8,
    smartphone: {
      smooth: true,
      lerp: 1,
      multiplier: 0.8,
    },
    tablet: {
      smooth: true,
      lerp: 1,
      multiplier: 0.8,
    },
  })

  return locomotiveScroll
}

export function destroyLocomotiveScroll() {
  if (locomotiveScroll) {
    locomotiveScroll.destroy()
    locomotiveScroll = null
  }
}

export function getLocomotiveScroll(): LocomotiveScroll | null {
  return locomotiveScroll
}
