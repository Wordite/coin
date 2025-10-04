import { Subtitle } from '../Subtitle/Subtitle'
import { Title } from '../Title/Title'
import { TitleUnderline } from '../TitleUnderline/TitleUnderline'

interface SectionHeadProps {
  title: string
  subtitle?: string
  withUnderline?: boolean
  underlineWidth?: string
  className?: string
  isLoading?: boolean
}

const SectionHead = ({
  title,
  subtitle,
  withUnderline = false,
  underlineWidth = 'w-[17.625rem]',
  className = '',
  isLoading = false,
}: SectionHeadProps) => {
  return (
    <div className={`section-head flex flex-col items-center ${className}`}>
      <Title isLoading={isLoading}>{title}</Title>
      {withUnderline && (
        <TitleUnderline
          color='purple'
          width={underlineWidth}
          className='mt-[.938rem] max-md:mt-[1.175rem] mb-[1.438rem] max-md:mb-[1.8rem]'
        />
      )}

      {subtitle && <Subtitle isLoading={isLoading}>{subtitle}</Subtitle>}
    </div>
  )
}

export { SectionHead }
