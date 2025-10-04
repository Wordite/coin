import { ReactNode } from 'react'
import { useLocomotive } from '@/hooks/useLocomotive'
import { cn } from '@/shared/lib/classNames'

interface AnchorLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const AnchorLink = ({ href, children, className, onClick }: AnchorLinkProps) => {
  const { handleAnchorLink } = useLocomotive()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }
    
    handleAnchorLink(href)
  }

  return (
    <a 
      href={href} 
      className={cn('cursor-pointer', className)}
      onClick={handleClick}
    >
      {children}
    </a>
  )
} 