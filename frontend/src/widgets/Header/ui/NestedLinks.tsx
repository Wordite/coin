import { Link } from 'react-router'
import { useRem } from '@/hooks/useRem'
import { useLinkCoordsWatcher, useLinkHoverWatcher } from '../model'
import { AnchorLink } from '@/shared/AnchorLink'
import { useMemo, useCallback, memo } from 'react'
import '../styles/NestedLinks.scss'
import { useIsMobile } from '@/hooks/useIsMobile'

interface NestedLinksProps {
  links: {
    label: string
    href: string
  }[]
  targetLabel: string
}

const NestedLinks = memo(({ links, targetLabel }: NestedLinksProps) => {
  const { rem } = useRem()
  const isHovered = useLinkHoverWatcher(targetLabel, rem(2.5))
  useLinkCoordsWatcher(targetLabel)
  const isMobile = useIsMobile()

  const isAnchorLink = useCallback((link: string) => link.includes('#'), [])

  const navClassName = useMemo(() => 
    `nested-links ${isHovered ? 'show' : ''}`, 
    [isHovered]
  )

  const renderedLinks = useMemo(() => 
    links.map((link) => (
      isAnchorLink(link.href) ? (
        <AnchorLink key={link.href} href={link.href}>
          {link.label}
        </AnchorLink>
      ) : (
        <Link key={link.href} to={link.href}>
          {link.label}
        </Link>
      )
    )), 
    [links, isAnchorLink]
  )

  if (isMobile) return null

  return (
    <nav className={navClassName}>
      <div className='nested-links-content'>
        {renderedLinks}
      </div>
    </nav>
  )
})

NestedLinks.displayName = 'NestedLinks'

export { NestedLinks }
