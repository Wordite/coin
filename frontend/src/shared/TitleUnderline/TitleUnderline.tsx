interface TitleUnderlineProps {
  className?: string
  color: GradientClass
  width: string
}

const GradientClasses = {
  purple: 'bg-[image:var(--color-gradient-purple-blue-4)]',
  dark: 'bg-[image:var(--color-gradient-white-dark)]',
  white: 'bg-[image:var(--color-gradient-white)]',
}

type GradientClass = keyof typeof GradientClasses

const TitleUnderline = ({ className, color, width }: TitleUnderlineProps) => {
  return <div className={`h-[0.188rem] ${GradientClasses[color]} ${className} ${width}`} />
}

export { TitleUnderline }
