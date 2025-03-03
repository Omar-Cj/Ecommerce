import { defineConfig } from 'vite'
import { resolve } from 'path'

// Custom plugin to rewrite "/admin" to "/admin/index.html"
function adminIndexFallback() {
  return {
    name: 'admin-index-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin') {
          req.url = '/admin/index.html'
        }
        next()
      })
    }
  }
}

export default defineConfig({
  base: './', // Use relative paths for assets
  plugins: [adminIndexFallback()],
  build: {
    rollupOptions: {
      // Define multiple entry points for your multi-page app
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
})