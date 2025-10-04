import React from 'react'
import { useRem } from '@/hooks/useRem'
import { PieSlice } from '@/shared/PieSlice/PieSlice'

interface PieChartData {
  name?: string
  percentage: number
  color: string
}

interface PieChartProps {
  data: PieChartData[]
  size?: number
  strokeWidth?: number
  gap?: number
  className?: string
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 240,
  strokeWidth = 16,
  gap = 2,
  className = '',
}) => {
  const { rem } = useRem()
  const pxSize = rem(size)
  const pxStroke = rem(strokeWidth)

  const radius = pxSize / 2
  const center = pxSize / 2
  const normalizedRadius = radius - pxStroke / 2
  const circumference = 2 * Math.PI * normalizedRadius

  const adjustedGap = gap + pxStroke

  const totalGaps = data.length
  const totalGapLength = totalGaps * adjustedGap
  const availableLength = Math.max(0, circumference - totalGapLength)

  const getTextWidth = (text: string, fontSize: number) => {
    return text.length * fontSize * 0.35
  }

  let currentOffset = 0

  const textBlocks = data.map((item, i) => {
    const segmentLength = (item.percentage / 100) * availableLength
    const segmentAngle = (segmentLength / circumference) * 360
    const startAngle = (currentOffset / circumference) * 360
    const middleAngle = startAngle + segmentAngle / 2

    const titleWidth = item.name ? getTextWidth(item.name, rem(1.25)) : 0
    const subtitleWidth = item.name ? getTextWidth(item.name, rem(0.875)) : 0
    const maxTextWidth = Math.max(titleWidth, subtitleWidth)

    const angleRad = (middleAngle - 90) * (Math.PI / 180)
    const cosAngle = Math.abs(Math.cos(angleRad))
    const sinAngle = Math.abs(Math.sin(angleRad))

    const baseOffset = maxTextWidth / 2 + rem(1)
    const angleMultiplier = cosAngle * 1 + sinAngle * 0.4
    const textOffset = baseOffset * angleMultiplier

    const textRadius = normalizedRadius + pxStroke + textOffset
    const textX = center + textRadius * Math.cos(angleRad)
    const textY = center + textRadius * Math.sin(angleRad)

    currentOffset += segmentLength + adjustedGap

    return {
      ...item,
      x: textX,
      y: textY,
      angle: middleAngle,
    }
  })

  currentOffset = 0

  return (
    <div className={`relative ${className}`} style={{ width: pxSize, height: pxSize }}>
      <svg
        viewBox={`0 0 ${pxSize} ${pxSize}`}
        width={pxSize}
        height={pxSize}
        className={`w-[${pxSize}px] h-[${pxSize}px] absolute inset-0`}
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          {data.map((item, i) => {
            const segmentLength = (item.percentage / 100) * availableLength
            const slice = (
              <PieSlice
                key={i}
                delay={i * 0.1}
                center={center}
                normalizedRadius={normalizedRadius}
                strokeWidth={pxStroke}
                segmentLength={segmentLength}
                circumference={circumference}
                color={item.color}
                offset={-currentOffset}
              />
            )

            currentOffset += segmentLength + adjustedGap
            return slice
          })}
        </g>
      </svg>

      {textBlocks.map((block, i) => (
        <div
          key={i}
          className='absolute transform -translate-x-1/2 -translate-y-1/2 text-center'
          style={{
            left: block.x,
            top: block.y,
          }}
        >
          <div className={`text-[1.25rem] font-bold leading-[1em]`} style={{ color: block.color }}>
            {block.percentage}%
          </div>

          {block.name && (
            <div className='text-[.875rem] text-white-transparent-75 leading-[1em] mt-[.35rem]'>
              {block.name}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
