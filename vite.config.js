import { defineConfig } from 'vite'
import { resolve, basename } from 'path'
import { globSync } from 'glob'

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

// Helper function to grab all HTML files from a given folder
function getHtmlInputs(folder) {
  const pattern = resolve(__dirname, `${folder}/*.html`)
  const files = globSync(pattern)
  return files.reduce((acc, filePath) => {
    // Use folder name and file basename (without extension) to form a key.
    const name = basename(filePath, '.html')
    acc[`${folder}-${name}`] = filePath
    return acc
  }, {})
}

const adminInputs = getHtmlInputs('admin')
const pagesInputs = getHtmlInputs('pages')

export default defineConfig({
  base: './', // Use relative paths for assets
  plugins: [adminIndexFallback()],
  build: {
    rollupOptions: {
      // Define multiple entry points by merging the inputs from admin and pages
      input: {
        main: resolve(__dirname, 'index.html'),
        ...adminInputs,
        ...pagesInputs
      }
    }
  }
})
