import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const redmineProxyTarget = env.VITE_REDMINE_PROXY_TARGET || ''
  const devPort = Number(env.VITE_DEV_PORT) || 5173

  return {
    plugins: [vue()],
    server: {
      port: devPort,
      ...(redmineProxyTarget && {
        proxy: {
          '/redmine-api': {
            target: redmineProxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/redmine-api/, '')
          }
        }
      })
    }
  }
})
