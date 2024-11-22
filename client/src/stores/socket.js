import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useWebRTCStore } from './webrtc'
import { useSettingsStore } from './settings'

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
    isConnected: false,
    onlineUsers: 0,
    currentPartner: null,
    isSearching: false
  }),

  actions: {
    initializeSocket() {
      if (this.socket) return

      const serverUrl = getServerUrl()
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.setupSocketListeners()
    },

    setupSocketListeners() {
      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Connected to server with ID:', this.socket.id)
      })

      this.socket.on('online_users_update', (count) => {
        this.onlineUsers = count
      })

      this.socket.on('match_found', (partner) => {
        this.isSearching = false
        this.currentPartner = partner
        const webrtcStore = useWebRTCStore()
        webrtcStore.callPeer(partner.peerId)
      })

      this.socket.on('call_disconnected', () => {
        this.currentPartner = null
        const webrtcStore = useWebRTCStore()
        webrtcStore.cleanup()
      })

      this.socket.on('peer_skipped', () => {
        this.currentPartner = null
        const webrtcStore = useWebRTCStore()
        webrtcStore.cleanup()
        
        this.startChat({
          username: useSettingsStore().username,
          mood: useSettingsStore().mood,
          preferences: useSettingsStore().preferences,
          peerId: webrtcStore.peerId,
          isCameraOn: webrtcStore.isCameraOn,
          isMicOn: webrtcStore.isMicOn
        })
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        this.currentPartner = null
        const webrtcStore = useWebRTCStore()
        webrtcStore.cleanup()
      })

      this.socket.on('toggle_camera_status', (status) => {
        if (this.currentPartner) {
          this.currentPartner.isCameraOn = status
        }
      })

      this.socket.on('toggle_microphone_status', (status) => {
        if (this.currentPartner) {
          this.currentPartner.isMicOn = status
        }
      })
    },

    startChat(userInfo) {
      this.socket.emit('start', {
        ...userInfo,
        peerId: useWebRTCStore().peerId,
        isCameraOn: useWebRTCStore().isCameraOn,
        isMicOn: useWebRTCStore().isMicOn
      })
      this.isSearching = true
    },

    skipPartner() {
      this.socket.emit('skip')
      this.isSearching = true
      this.currentPartner = null
    },

    disconnectCall() {
      this.socket.emit('disconnect_request')
      this.currentPartner = null
      this.isSearching = false
    },

    updateUserInfo(info) {
      this.socket.emit('update_info', info)
      if (this.currentPartner) {
        this.socket.emit('user_info_updated', info)
      }
    },

    sendMessage(message) {
      this.socket.emit('send_message', message)
    },

    updateMediaStatus(type, status) {
      this.socket.emit(`toggle_${type}`, status)
    }
  }
}) 