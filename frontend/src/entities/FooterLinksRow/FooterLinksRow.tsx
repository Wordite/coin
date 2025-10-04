import { Link } from 'react-router'
import { AnchorLink } from '@/shared/AnchorLink'

interface FooterLinksRowProps {
  title: string
  links: {
    title: string
    link: string
  }[]
  className?: string
}

const FooterLinksRow = ({ title, links, className }: FooterLinksRowProps) => {
  const isAnchorLink = (link: string) => link.includes('#')

  return (
    <div className={`${className} `}>
      <h6 className='text-white text-[1.25rem] max-md:text-[2rem] font-semibold'>{title}</h6>

      <nav>
        <ul className='text-[1rem] max-md:text-[1.6rem] text-white-transparent-50 flex flex-col gap-[1.563rem] max-md:gap-[2.5rem] mt-[.938rem] max-md:mt-[1.5rem]'>
          {links.map((link) => (
            <li key={link.title}>
              {isAnchorLink(link.link) ? (
                <AnchorLink href={link.link} className='hover:text-white transition-colors duration-300 max-md:text-[1.6rem]'>
                  {link.title}
                </AnchorLink>
              ) : (
                <Link to={link.link} className='hover:text-white transition-colors duration-300 max-md:text-[1.6rem]'>
                  {link.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export { FooterLinksRow }
