import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useWebRTCStore } from './webrtc'

// Get the server URL from environment or construct it
const getServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL
  }
  
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = 3000
  return `${protocol}//${hostname}:${port}`
}

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    username: '',
    isConnected: false,
    partnerId: null
  }),

  actions: {
    initializeSocket() {
      if (this.socket) return

      const serverUrl = getServerUrl()
      console.log('Connecting to server:', serverUrl)
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully with ID:', this.socket.id)
        this.isConnected = true
        console.log('Connected to server:', serverUrl)
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      this.socket.on('connect_timeout', () => {
        console.error('Socket connection timeout')
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.isConnected = false
        console.log('Disconnected from server')
        const webrtcStore = useWebRTCStore()
        webrtcStore.cleanup()
      })

      this.socket.on('call-error', (error) => {
        console.error('Call error:', error)
        const webrtcStore = useWebRTCStore()
        webrtcStore.cleanup()
      })

      this.socket.on('waiting-for-partner', () => {
        console.log('Waiting for partner...')
      })
    },

    setUsername(name) {
      this.username = name
      this.socket.emit('set-username', name)
    },

    updateMood(mood, preferences) {
      this.socket.emit('update-mood', { mood, preferences })
    }
  }
}) 