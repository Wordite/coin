import { useSectionData } from '@/hooks'
import { HeaderLink } from './HeaderLink'
import { HomeLinks } from '@/config/homeLinks'

const Links = () => {
  const {
    data: { links: headerLinks },
    isLoading: isHeaderLinksLoading,
    error: headerLinksError,
  } = useSectionData('HeaderLinks')

  if (isHeaderLinksLoading || headerLinksError) return null

  return (
    <nav className='h-full max-md:hidden'>
      <ul className='flex items-center h-full gap-[2.5rem] text-[1.125rem]'>
        {[HomeLinks, ...headerLinks].map((link, index) => (
          <li className='h-full link-home flex items-center' key={index}>
            <HeaderLink label={link.label || link.textField1} href={link.href || link.textField2} nestedLinks={link.nestedLinks} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { Links }
