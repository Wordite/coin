import { AnchorLink } from '@/shared/AnchorLink'
import { Link } from 'react-router'
import ArrowIcon from '@/assets/icons/arrow.svg'
import { useLinkHoverWatcher } from '../model'
import { useRem } from '@/hooks/useRem'
import { useCallback, memo } from 'react'

interface LinkProps {
  label: string
  href: string
  nestedLinks?: { label: string; href: string }[]
}

const HeaderLink = memo(({ label, href, nestedLinks }: LinkProps) => {
  const isAnchorLink = useCallback((link: string) => link.includes('#'), [])

  if (nestedLinks) {
    const { rem } = useRem()
    const isHovered = useLinkHoverWatcher(label, rem(2.5))

    return (
      <div className='relative group cursor-default h-full'>
        <p className='py-2 h-full flex items-center gap-[.75rem]'>
          <AnchorLink href={href} className='block py-2'>
            {label}
          </AnchorLink>
          <ArrowIcon className={`w-[.875rem] h-[.375rem] mt-[.063rem] ${isHovered ? 'rotate-180' : ''} duration-150`} />
        </p>
      </div>
    )
  }

  if (isAnchorLink(href)) {
    return (
      <AnchorLink href={href} className='block py-2 hover:text-purple-500 duration-150'>
        {label}
      </AnchorLink>
    )
  }

  return (
    <Link to={href} className='block py-2 hover:text-purple-500 duration-150'>
      {label}
    </Link>
  )
})

HeaderLink.displayName = 'HeaderLink'

export { HeaderLink }
