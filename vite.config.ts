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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'ui-vendor': ['lucide-react', 'sonner'],
          'editor-vendor': ['@tinymce/tinymce-react', 'tinymce'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'state-vendor': ['zustand'],

                    // Feature chunks
          'posts-feature': ['src/features/posts/index.ts'],
          'brokers-feature': ['src/features/brokers/index.ts'],
          'users-feature': ['src/features/users/index.ts'],
          'banners-feature': ['src/features/banners/index.ts'],
          'products-feature': ['src/features/products/index.ts']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging
    sourcemap: true
  }
})
