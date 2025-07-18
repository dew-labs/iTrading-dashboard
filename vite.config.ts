import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router-dom')) {
              return 'router-vendor'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            if (id.includes('lucide-react') || id.includes('sonner')) {
              return 'ui-vendor'
            }
            if (id.includes('@tinymce') || id.includes('tinymce')) {
              return 'editor-vendor'
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor'
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor'
            }
            if (id.includes('zustand')) {
              return 'state-vendor'
            }
            // Other node_modules go to vendor chunk
            return 'vendor'
          }

          // Split large features into smaller chunks
          if (id.includes('src/features/posts') || id.includes('src/components/features/posts')) {
            if (id.includes('RichTextEditor') || id.includes('tinymce')) {
              return 'posts-editor'
            }
            return 'posts-feature'
          }
          if (id.includes('src/features/users') || id.includes('src/components/features/users')) {
            return 'users-feature'
          }
          if (id.includes('src/features/brokers') || id.includes('src/components/features/brokers')) {
            return 'brokers-feature'
          }
          if (id.includes('src/features/banners') || id.includes('src/components/features/banners')) {
            return 'banners-feature'
          }
          if (id.includes('src/features/products') || id.includes('src/components/features/products')) {
            return 'products-feature'
          }

          // Shared components
          if (id.includes('src/components/molecules') || id.includes('src/components/atoms')) {
            return 'ui-components'
          }
          if (id.includes('src/hooks')) {
            return 'hooks'
          }
          if (id.includes('src/utils')) {
            return 'utils'
          }
          if (id.includes('src/locales')) {
            return 'i18n-data'
          }
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging
    sourcemap: true,
    // Minification options
    minify: 'esbuild',
    // Target modern browsers for better optimization
    target: 'es2020'
  }
})
