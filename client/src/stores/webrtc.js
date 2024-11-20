import { defineStore } from 'pinia'
import PeerService from '@/services/peer.service'
import { useSocketStore } from './socket'

export const useWebRTCStore = defineStore('webrtc', {
  state: () => ({
    localStream: null,
    remoteStream: null,
    isCameraOn: true,
    isMicOn: true,
    peerId: null
  }),

  actions: {
    async initialize() {
      try {
        // Get media stream
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        // Initialize PeerJS
        const socketStore = useSocketStore()
        this.peerId = await PeerService.initialize()
        socketStore.socket.emit('register-peer', this.peerId)

        // Handle incoming calls
        PeerService.onIncomingCall(async (remoteStream) => {
          this.remoteStream = remoteStream
        })

        return true
      } catch (error) {
        console.error('Failed to initialize:', error)
        return false
      }
    },

    async callPeer(remotePeerId) {
      try {
        this.remoteStream = await PeerService.call(remotePeerId, this.localStream)
      } catch (error) {
        console.error('Error calling peer:', error)
        throw error
      }
    },

    toggleCamera() {
      const videoTrack = this.localStream?.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        this.isCameraOn = videoTrack.enabled
      }
    },

    toggleMicrophone() {
      const audioTrack = this.localStream?.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isMicOn = audioTrack.enabled
      }
    },

    cleanup() {
      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach(track => track.stop())
        this.remoteStream = null
      }
      PeerService.endCall()
    }
  }
}) 