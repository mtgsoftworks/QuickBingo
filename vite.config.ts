import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0' // Mobile testing için
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // Production'da source map'leri devre dışı bırak
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          material: ['@mui/material', '@mui/icons-material'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          router: ['react-router-dom'],
          utils: ['framer-motion', 'react-hot-toast', 'howler', 'react-i18next']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Console.log'ları kaldır
        drop_debugger: true, // Debugger'ları kaldır
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Belirli console fonksiyonlarını kaldır
      },
      mangle: {
        properties: {
          regex: /^_/ // Underscore ile başlayan property'leri karıştır
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Chunk boyut uyarı limitini artır
  },
  define: {
    __DEV__: false // Development flag'ini false yap
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/database'
    ]
  }
});
