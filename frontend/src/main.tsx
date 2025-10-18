import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from '@/app/routes/router.ts'
import { ToastProvider } from './shared/Toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SkeletonTheme } from 'react-loading-skeleton'
import { AppKitProvider } from '@reown/appkit/react'
import { solana } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WalletConnectionHandler } from './app/WalletConnectionHandler'
import 'react-loading-skeleton/dist/skeleton.css'
import './index.css'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'

export const queryClient = new QueryClient()
const solanaWeb3JsAdapter = new SolanaAdapter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppKitProvider
      projectId='b58af2f1db4655583f8b265967911e0a'
      networks={[solana]}
      adapters={[solanaWeb3JsAdapter]}
      metadata={{
        name: 'Tycoin',
        description: 'Tycoin Application',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      }}
      enableWalletConnect={true}
      enableWallets={true}
      enableWalletGuide={false}
      features={{
        email: false,
        socials: [],
        emailShowWallets: true,
        analytics: true
      }}
      debug={true}
    >
      <QueryClientProvider client={queryClient}>
        <SkeletonTheme
          borderRadius='var(--radius-md)'
          baseColor='var(--color-gray-transparent-50)'
          highlightColor='var(--color-gray-transparent-10)'
          >
          <ToastProvider>
            <WalletConnectionHandler />
            <RouterProvider router={router} />
          </ToastProvider>
        </SkeletonTheme>
      </QueryClientProvider>
    </AppKitProvider>
  </StrictMode>
)
