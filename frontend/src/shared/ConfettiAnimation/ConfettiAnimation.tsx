import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useConfettiStore } from '@/app/store/confettiStore'

export const ConfettiAnimation = () => {
  const { isActive, onComplete } = useConfettiStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    })

    const container = containerRef.current
    const confettiCount = 50
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']

    // Create confetti elements
    const confettiElements: HTMLDivElement[] = []

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.style.position = 'absolute'
      confetti.style.width = '10px'
      confetti.style.height = '10px'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%'
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.top = '0px'
      confetti.style.pointerEvents = 'none'
      confetti.style.zIndex = '9999'

      container.appendChild(confetti)
      confettiElements.push(confetti)
    }

    // Animate confetti
    const tl = gsap.timeline({
      onComplete: () => {
        // Clean up
        confettiElements.forEach((el) => el.remove())
        onComplete?.()
      },
    })

    confettiElements.forEach((confetti) => {
      const randomX = (Math.random() - 0.5) * 400
      const randomY = Math.random() * 300 + 200
      const randomRotation = Math.random() * 720 - 360
      const randomScale = Math.random() * 0.5 + 0.5
      const randomDelay = Math.random() * 0.5

      tl.fromTo(
        confetti,
        {
          y: 0,
          x: 0,
          rotation: 0,
          scale: 0,
          opacity: 1,
        },
        {
          y: randomY,
          x: randomX,
          rotation: randomRotation,
          scale: randomScale,
          opacity: 0,
          duration: 2 + Math.random(),
          delay: randomDelay,
          ease: 'power2.out',
        },
        randomDelay
      )
    })

    return () => {
      confettiElements.forEach((el) => el.remove())
    }
  }, [isActive, onComplete])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
