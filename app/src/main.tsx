import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppKitProvider } from '@reown/appkit/react'
import { solana } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import App from './App.tsx'
import './index.css'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'

const solanaAdapter = new SolanaAdapter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppKitProvider
      projectId='b58af2f1db4655583f8b265967911e0a'
      networks={[solana]}
      adapters={[solanaAdapter]}
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
        analytics: true,
      }}
      themeVariables={{
        '--w3m-font-family': 'Inter',
        '--w3m-accent': '#9823dd',
      }}
    >
      <App />
    </AppKitProvider>
  </StrictMode>,
)
