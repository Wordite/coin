const Links = {
  Home: '/#hero',
  About: '/about',
  FAQ: '/#faq',
  Contact: '/#contact',
  Documentation: '/documentation',
  TermsOfUse: '/terms-of-use',
  PrivacyPolicy: '/privacy-policy',
  CookiePolicy: '/cookie-policy',
  Security: '/security',
  Staking: '/#staking',
  Purchase: '/#purchase',
  SecurityAudit: '/#security-audit',
  PresaleDetails: '/#presale-details',
  Roadmap: '/#roadmap',
  Benefits: '/#our-benefits',
  Tokenomics: '/#tokenomics',
} as const

type Links = (typeof Links)[keyof typeof Links]

export { Links }
export type { Links }
