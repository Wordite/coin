import { AnchorLink } from '@/shared/AnchorLink'
import { Link } from 'react-router'


const HeaderLink = ({ label, href }: { label: string; href: string }) => {
    const isAnchorLink = (link: string) => link.includes('#')

  return (
    <Link to={href} className='block py-2'>
      {label}
    </Link>
    
  )
}

export { HeaderLink }