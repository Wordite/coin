import { createBrowserRouter } from 'react-router'
import { Home } from '@/pages/Home'
import { Container } from '@/app/Container'
import { Profile } from '@/pages/Profile'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { About } from '@/pages/About'
import { Dynamic } from '@/pages/Dynamic'
import { NotFound } from '@/pages/NotFound'

const router = createBrowserRouter([
  {
    Component: Container,
    children: [
      { index: true, Component: Home },
      { path: '/profile', Component: Profile },
      { path: '/privacy-policy', Component: PrivacyPolicy },
      { path: '/about', Component: About },
      { path: '/:url', Component: Dynamic },
      { path: '*', Component: NotFound },
    ],
  },
])

export { router }
