import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface PieSliceProps {
  center: number
  normalizedRadius: number
  strokeWidth: number
  segmentLength: number
  circumference: number
  color: string
  offset: number
  delay?: number
}

export const PieSlice = ({
  center,
  normalizedRadius,
  strokeWidth,
  segmentLength,
  circumference,
  color,
  offset,
  delay = 0,
}: PieSliceProps) => {
  const sliceRef = useRef<SVGCircleElement | null>(null)
  const outlineRef = useRef<SVGCircleElement | null>(null)

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#', '')
    const bigint = parseInt(
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h,
      16
    )
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const fillColor = hexToRgba(color, 0.18)
  const outlineColor = color

  useEffect(() => {
    if (!sliceRef.current || !outlineRef.current) return

    gsap.set([sliceRef.current, outlineRef.current], {
      strokeDasharray: `0 ${circumference}`,
      strokeDashoffset: offset,
      opacity: 0
    })

    gsap.to([sliceRef.current, outlineRef.current], {
      strokeDasharray: `${segmentLength} ${circumference}`,
      duration: 0.8,
      ease: 'power2.out',
      opacity: 1,
      delay,
    })
  }, [segmentLength, circumference, offset, delay])

  return (
    <g>
      <circle
        ref={sliceRef}
        r={normalizedRadius}
        cx={center}
        cy={center}
        fill='none'
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
      />
      <circle
        ref={outlineRef}
        r={normalizedRadius}
        cx={center}
        cy={center}
        fill='none'
        stroke={outlineColor}
        strokeWidth={Math.max(1, strokeWidth * 0.65)}
        strokeLinecap='round'
      />
    </g>
  )
}
