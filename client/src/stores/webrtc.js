import { defineStore } from 'pinia'
import { useSocketStore } from './socket'
import webRTCService from '../services/webrtc.service'

export const useWebRTCStore = defineStore('webrtc', {
  state: () => ({
    localStream: null,
    remoteStream: null,
    isCameraOn: true,
    isMicOn: true,
    isInCall: false,
    currentPartner: null,
    connectionState: 'new'
  }),

  actions: {
    async initializeMedia() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        return true
      } catch (error) {
        console.error('Error accessing media devices:', error)
        return false
      }
    },

    async createPeerConnection(partnerId) {
      try {
        const socketStore = useSocketStore()
        this.currentPartner = partnerId

        await webRTCService.createPeerConnection()

        // Add local tracks
        this.localStream.getTracks().forEach(track => {
          webRTCService.addTrack(track, this.localStream)
        })

        // Handle remote stream
        webRTCService.onTrack((event) => {
          console.log('Received remote track:', event.streams[0])
          this.remoteStream = event.streams[0]
        })

        // Handle ICE candidates
        webRTCService.onIceCandidate((event) => {
          if (event.candidate) {
            socketStore.socket.emit('ice-candidate', {
              candidate: event.candidate,
              to: this.currentPartner
            })
          }
        })

        // Monitor connection state
        webRTCService.onConnectionStateChange(() => {
          this.connectionState = webRTCService.peerConnection.connectionState
          console.log('Connection state:', this.connectionState)
        })

      } catch (error) {
        console.error('Error in createPeerConnection:', error)
        throw error
      }
    },

    async createOffer() {
      try {
        return await webRTCService.createOffer()
      } catch (error) {
        console.error('Error in createOffer:', error)
        throw error
      }
    },

    async handleOffer(offer) {
      try {
        return await webRTCService.handleOffer(offer)
      } catch (error) {
        console.error('Error in handleOffer:', error)
        throw error
      }
    },

    async handleAnswer(answer) {
      try {
        await webRTCService.handleAnswer(answer)
      } catch (error) {
        console.error('Error in handleAnswer:', error)
        throw error
      }
    },

    async handleIceCandidate(candidate) {
      try {
        await webRTCService.addIceCandidate(candidate)
      } catch (error) {
        console.error('Error in handleIceCandidate:', error)
      }
    },

    toggleCamera() {
      const videoTrack = this.localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      this.isCameraOn = videoTrack.enabled
    },

    toggleMicrophone() {
      const audioTrack = this.localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      this.isMicOn = audioTrack.enabled
    },

    cleanup() {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
      }
      webRTCService.close()
      this.localStream = null
      this.remoteStream = null
      this.isInCall = false
      this.currentPartner = null
      this.connectionState = 'new'
    }
  }
}) 