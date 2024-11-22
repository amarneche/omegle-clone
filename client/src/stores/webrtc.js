import { defineStore } from 'pinia'
import PeerService from '@/services/peer.service'
import { useSocketStore } from './socket'

export const useWebRTCStore = defineStore('webrtc', {
  state: () => ({
    localStream: null,
    remoteStream: null,
    isCameraOn: true,
    isMicOn: true,
    peerId: null,
    currentCall: null
  }),

  actions: {
    async initialize() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        this.peerId = await PeerService.initialize()
        
        PeerService.onIncomingCall(async (remoteStream) => {
          this.remoteStream = remoteStream
        })

        return true
      } catch (error) {
        console.error('WebRTC initialization failed:', error)
        return false
      }
    },

    async callPeer(remotePeerId) {
      try {
        this.remoteStream = await PeerService.call(remotePeerId, this.localStream)
        this.currentCall = remotePeerId
      } catch (error) {
        console.error('Call failed:', error)
        const socketStore = useSocketStore()
        socketStore.disconnectCall()
      }
    },

    toggleCamera() {
      const videoTrack = this.localStream?.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        this.isCameraOn = videoTrack.enabled
        const socketStore = useSocketStore()
        socketStore.updateMediaStatus('camera', this.isCameraOn)
      }
    },

    toggleMicrophone() {
      const audioTrack = this.localStream?.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isMicOn = audioTrack.enabled
        const socketStore = useSocketStore()
        socketStore.updateMediaStatus('microphone', this.isMicOn)
      }
    },

    cleanup() {
      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach(track => track.stop())
        this.remoteStream = null
      }
      if (this.currentCall) {
        PeerService.endCall(this.currentCall)
        this.currentCall = null
      }
    }
  }
}) 