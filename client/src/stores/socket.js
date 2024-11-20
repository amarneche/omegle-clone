import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

// Get the server URL from environment or construct it
const getServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL
  }
  
  // For development, use the local network IP
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3000`
}

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    username: '',
    isConnected: false
  }),

  actions: {
    initializeSocket() {
      const serverUrl = getServerUrl()
      this.socket = io(serverUrl)
      
      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Connected to server:', serverUrl)
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('Disconnected from server')
      })
    },

    setUsername(name) {
      this.username = name
      this.socket.emit('set-username', name)
    }
  }
}) 