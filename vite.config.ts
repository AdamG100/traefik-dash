import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Mirrors server.js's proxy so `npm run dev` can reach Traefik too.
        // The `traefik` service name only resolves inside the Docker network,
        // so set VITE_TRAEFIK_API_URL in .env to an address reachable from
        // your host machine (localhost port-forward, VPN, etc).
        '/api': {
          target: env.VITE_TRAEFIK_API_URL || 'http://traefik:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
