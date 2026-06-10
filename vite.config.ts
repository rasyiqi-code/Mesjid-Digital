import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Menaikkan batas peringatan ukuran chunk menjadi 1000 kB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Membagi dependensi pihak ketiga (vendor) ke dalam chunk terpisah
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
