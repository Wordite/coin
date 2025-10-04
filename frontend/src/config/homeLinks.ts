import { Links } from './links'

const HomeLinks = {
  label: 'Home',
  href: Links.Home,
  nestedLinks: [
    {
      label: 'Our Benefits',
      href: Links.Benefits,
    },
    {
      label: 'Tokenomics',
      href: Links.Tokenomics,
    },
    {
      label: 'Presale Details',
      href: Links.PresaleDetails,
    },
    {
      label: 'Roadmap',
      href: Links.Roadmap,
    },
    {
      label: 'Contact',
      href: Links.Contact,
    },
    {
      label: 'FAQ',
      href: Links.FAQ,
    },
  ],
}

export { HomeLinks }
