class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.senders = new Map()
    
    // Get ICE servers from environment
    this.configuration = {
      iceServers:  [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
    }
  }

  async createPeerConnection() {
    try {
      if (this.peerConnection) {
        this.close()
      }
      this.peerConnection = new RTCPeerConnection(this.configuration)
      this.senders.clear()
      return this.peerConnection
    } catch (error) {
      console.error('Error creating peer connection:', error)
      throw error
    }
  }

  addTrack(track, stream) {
    try {
      if (!this.peerConnection || this.peerConnection.signalingState === 'closed') {
        throw new Error('PeerConnection is not initialized or is closed')
      }

      const existingSender = this.senders.get(track.kind)
      if (existingSender) {
        existingSender.replaceTrack(track)
      } else {
        const sender = this.peerConnection.addTrack(track, stream)
        this.senders.set(track.kind, sender)
      }
    } catch (error) {
      console.error('Error adding track:', error)
      throw error
    }
  }

  async createOffer() {
    try {
      if (!this.peerConnection || this.peerConnection.signalingState === 'closed') {
        throw new Error('PeerConnection is not initialized or is closed')
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true
      })

      await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer))
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  async handleOffer(offer) {
    try {
      if (!this.peerConnection || this.peerConnection.signalingState === 'closed') {
        throw new Error('PeerConnection is not initialized or is closed')
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer))
      return answer
    } catch (error) {
      console.error('Error handling offer:', error)
      throw error
    }
  }

  async handleAnswer(answer) {
    try {
      if (!this.peerConnection || this.peerConnection.signalingState === 'closed') {
        throw new Error('PeerConnection is not initialized or is closed')
      }

      if (this.peerConnection.signalingState === 'stable') {
        console.log('Connection is already stable, ignoring answer')
        return
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Error handling answer:', error)
      throw error
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (!this.peerConnection || !this.peerConnection.remoteDescription) {
        console.log('Queuing ICE candidate')
        return
      }
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      throw error
    }
  }

  onTrack(callback) {
    if (this.peerConnection) {
      this.peerConnection.ontrack = callback
    }
  }

  onIceCandidate(callback) {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = callback
    }
  }

  onConnectionStateChange(callback) {
    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = callback
    }
  }

  getSignalingState() {
    return this.peerConnection ? this.peerConnection.signalingState : 'closed'
  }

  close() {
    if (this.peerConnection) {
      try {
        this.senders.forEach(sender => {
          try {
            this.peerConnection.removeTrack(sender)
          } catch (e) {
            console.warn('Error removing track:', e)
          }
        })
        this.senders.clear()

        this.peerConnection.ontrack = null
        this.peerConnection.onicecandidate = null
        this.peerConnection.onconnectionstatechange = null
        this.peerConnection.close()
      } catch (err) {
        console.error('Error closing peer connection:', err)
      }
      this.peerConnection = null
    }
  }
}

export default new WebRTCService() 