import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      proxy: {
        '/api': {
          target: 'https://solve.ivy.homes',
          changeOrigin: true,
          secure: true,

          rewrite: (path) => path.replace(/^\/api/, ''),

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Try both VITE_API_KEY and IVY_API_KEY for backwards compatibility
              const apiKey = env.VITE_API_KEY || env.IVY_API_KEY
              if (apiKey) {
                proxyReq.setHeader(
                  'X-API-Key',
                  apiKey
                )
              }
            })
          },
        },
      },
    },
  }
})