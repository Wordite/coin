import { createBrowserRouter } from 'react-router'
import { Container } from '@/app/container/Container'
import { PageEditor } from '@/pages/PageEditor'
import { Login } from '@/pages/Login'
import { Presale } from '@/pages/Presale'
import { Activation } from '@/pages/Activation'
import { MediaLibrary } from '@/pages/MediaLibrary'
import SectionTypes from '@/pages/SectionTypes'
import Contents from '@/pages/Contents'
import { Settings } from '@/pages/Settings'
import Users from '@/pages/Users'
import { Contacts } from '@/pages/Contacts'
import Documentation from '@/pages/Documentation'
import DocumentationContent from '@/pages/DocumentationContent'
import DocumentationSettings from '@/pages/DocumentationSettings'
import LiveLogs from '@/pages/LiveLogs'
import { EmptyContainer } from '@/app/container/EmptyContainer'

export const router = createBrowserRouter([
  {
    Component: Container,
    children: [
      { index: true, Component: Presale },
      { path: 'presale', Component: Presale },
      { path: 'page-editor/:page', Component: PageEditor },
      { path: 'media-library', Component: MediaLibrary },
      { path: 'section-types', Component: SectionTypes },
      { path: 'contents', Component: Contents },
      { path: 'settings', Component: Settings },
      { path: 'users', Component: Users },
      { path: 'contacts', Component: Contacts },
      { path: 'live-logs', Component: LiveLogs },
      { path: 'documentation', Component: Documentation },
      { path: 'documentation/content', Component: DocumentationContent },
      { path: 'documentation/settings', Component: DocumentationSettings },
    ],
  },
  {
    Component: EmptyContainer,
    children: [
      { path: 'login', Component: Login },
      { path: 'activate/:link', Component: Activation },
    ],
  },
])
