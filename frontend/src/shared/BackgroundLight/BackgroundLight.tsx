import type { HTMLAttributes } from 'react'

interface BackgroundLightProps extends HTMLAttributes<HTMLDivElement> {
  color: 'purple' | 'green'
}

const baseStyles = 'absolute w-[20.688rem] h-[20.688rem] rounded-full blur-[6.25rem] z-[-50]'

const styles: Record<BackgroundLightProps['color'], string> = {
  purple: 'bg-background-light-purple',
  green: 'bg-background-light-green',
}

const BackgroundLight = ({ color, className = '', ...props }: BackgroundLightProps) => {
  return <div {...props} className={`${baseStyles} ${styles[color]} ${className}`} />
}

export { BackgroundLight }
