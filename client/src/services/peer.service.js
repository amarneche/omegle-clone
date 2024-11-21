import Peer from 'peerjs'
import { v4 as uuidv4 } from 'uuid'

class PeerService {
  constructor() {
    this.peer = null
    this.currentCall = null
    this.localStream = null
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(uuidv4(), {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        debug: 3,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        },
        retryTimer: 10000,
      })

      this.peer.on('open', (id) => {
        console.log('My peer ID is:', id)
        resolve(id)
      })

      this.peer.on('error', (error) => {
        if (error.type === 'network' || error.type === 'server-error') {
          console.error('PeerJS cloud server error:', error)
          setTimeout(() => {
            console.log('Attempting to reconnect to PeerJS server...')
            this.peer.reconnect()
          }, 5000)
        }
        reject(error)
      })

      this.peer.on('connection', (conn) => {
        console.log('Peer connection established:', conn.peer)
      })

      this.peer.on('disconnected', () => {
        console.log('Peer disconnected. Attempting to reconnect...')
        this.peer.reconnect()
      })
    })
  }

  async call(remotePeerId, localStream) {
    try {
      this.localStream = localStream
      console.log('Calling peer:', remotePeerId)
      this.currentCall = this.peer.call(remotePeerId, localStream)
      return this.handleCall(this.currentCall)
    } catch (error) {
      console.error('Error making call:', error)
      throw error
    }
  }

  onIncomingCall(callback) {
    this.peer.on('call', async (call) => {
      try {
        console.log('Incoming call from:', call.peer)
        this.currentCall = call
        
        // Answer the call with our local stream
        if (this.localStream) {
          call.answer(this.localStream)
        }
        
        // Handle the remote stream
        const remoteStream = await this.handleCall(call)
        callback(remoteStream)
      } catch (error) {
        console.error('Error handling incoming call:', error)
      }
    })
  }

  handleCall(call) {
    return new Promise((resolve) => {
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream')
        resolve(remoteStream)
      })

      call.on('close', () => {
        console.log('Call closed')
      })

      call.on('error', (error) => {
        console.error('Call error:', error)
      })
    })
  }

  endCall() {
    if (this.currentCall) {
      console.log('Ending call')
      this.currentCall.close()
      this.currentCall = null
    }
  }

  destroy() {
    this.endCall()
    if (this.peer) {
      console.log('Destroying peer connection')
      this.peer.destroy()
      this.peer = null
    }
  }
}

export default new PeerService() 