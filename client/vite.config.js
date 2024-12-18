import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [vue()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },

    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'pinia', 'vue-router'],
            'webrtc': ['socket.io-client']
          }
        }
      }
    }
  }

  if (command === 'serve') {
    config.server = {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        host: 'localhost'
      }
    }
  }

  return config
}) 