class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.senders = new Map()
    
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    }
  }

  async createPeerConnection() {
    try {
      if (this.peerConnection) {
        this.close()
      }
      this.peerConnection = new RTCPeerConnection(this.configuration)
      console.log('Created new peer connection:', this.peerConnection)
      return this.peerConnection
    } catch (error) {
      console.error('Error creating peer connection:', error)
      throw error
    }
  }

  addTrack(track, stream) {
    try {
      console.log('Adding track to peer connection:', track.kind)
      const existingSender = this.senders.get(track.kind)
      if (existingSender) {
        console.log('Replacing existing track:', track.kind)
        existingSender.replaceTrack(track)
      } else {
        console.log('Adding new track:', track.kind)
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
      console.log('Creating offer...')
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      
      console.log('Setting local description (offer):', offer.type)
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  async handleOffer(offer) {
    try {
      console.log('Setting remote description (offer):', offer.type)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      
      console.log('Creating answer...')
      const answer = await this.peerConnection.createAnswer()
      
      console.log('Setting local description (answer):', answer.type)
      await this.peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error('Error handling offer:', error)
      throw error
    }
  }

  async handleAnswer(answer) {
    try {
      if (this.peerConnection.signalingState === 'stable') {
        console.log('Connection already stable, ignoring answer')
        return
      }
      
      console.log('Setting remote description (answer):', answer.type)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Error handling answer:', error)
      throw error
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (!this.peerConnection || !this.peerConnection.remoteDescription) {
        console.log('Skipping ICE candidate: no remote description')
        return
      }
      console.log('Adding ICE candidate:', candidate.candidate)
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      throw error
    }
  }

  onTrack(callback) {
    if (!this.peerConnection) return
    console.log('Setting ontrack callback')
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      callback(event)
    }
  }

  onIceCandidate(callback) {
    if (!this.peerConnection) return
    console.log('Setting onicecandidate callback')
    this.peerConnection.onicecandidate = callback
  }

  onConnectionStateChange(callback) {
    if (!this.peerConnection) return
    console.log('Setting onconnectionstatechange callback')
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', this.peerConnection.connectionState)
      callback()
    }
  }

  close() {
    if (this.peerConnection) {
      console.log('Closing peer connection')
      this.senders.forEach(sender => {
        try {
          if (sender.track) {
            sender.track.stop()
          }
          this.peerConnection.removeTrack(sender)
        } catch (e) {
          console.warn('Error removing track:', e)
        }
      })
      this.senders.clear()

      this.peerConnection.ontrack = null
      this.peerConnection.onicecandidate = null
      this.peerConnection.onconnectionstatechange = null
      
      try {
        this.peerConnection.close()
      } catch (err) {
        console.warn('Error closing peer connection:', err)
      }
      this.peerConnection = null
    }
  }
}

export default new WebRTCService() 