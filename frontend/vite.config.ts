import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      include: '**/*.svg',
    }),
    nodePolyfills({
      protocolImports: true,
    }),
    // tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Example: aliasing '@' to the 'src' directory
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    cors: true,
    // Настраиваем для работы с мобильными кошельками
    hmr: {
      port: 5174
    }
  },
  // Добавляем define для Buffer
  define: {
    global: 'globalThis',
  },
  // Добавляем настройки для лучшей совместимости
  optimizeDeps: {
    include: ['buffer', '@solana/web3.js', '@solana/wallet-adapter-base']
  }
})
