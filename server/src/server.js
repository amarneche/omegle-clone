const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PeerServer } = require('peer')
const cors = require('cors')
const os = require('os')

const app = express()
const httpServer = createServer(app)

// Get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const LOCAL_IP = getLocalIP()
const PORT = process.env.PORT || 3000

// Create PeerJS server with explicit WebSocket server
const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
  proxied: true,
  ssl: {
    key: process.env.SSL_KEY_PATH,    // Add if using SSL
    cert: process.env.SSL_CERT_PATH   // Add if using SSL
  },
  allow_discovery: true,
  debug: true
})

// Log PeerJS events
peerServer.on('connection', (client) => {
  console.log('PeerJS Client connected:', client.getId())
})

peerServer.on('disconnect', (client) => {
  console.log('PeerJS Client disconnected:', client.getId())
})

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}))

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const activeUsers = new Map()
const waitingQueue = []

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('set-username', (username) => {
    activeUsers.set(socket.id, {
      username,
      peerId: null,
      inCall: false,
      mood: { type: 'casual', tags: [] },
      preferences: { language: 'any' }
    })
    io.emit('online-users', activeUsers.size)
  })

  socket.on('register-peer', (peerId) => {
    const user = activeUsers.get(socket.id)
    if (user) {
      user.peerId = peerId
    }
  })

  const findMatchForUser = (userId) => {
    const user = activeUsers.get(userId)
    if (!user || user.inCall || !user.peerId) return false

    // Find compatible partner
    const partnerIndex = waitingQueue.findIndex(id => {
      const partner = activeUsers.get(id)
      if (!partner || !partner.peerId || id === userId) return false
      
      return user.mood.type === partner.mood.type &&
        (user.preferences.language === 'any' || 
         partner.preferences.language === 'any' ||
         user.preferences.language === partner.preferences.language)
    })

    if (partnerIndex !== -1) {
      const partnerId = waitingQueue[partnerIndex]
      const partner = activeUsers.get(partnerId)
      
      // Remove partner from waiting queue
      waitingQueue.splice(partnerIndex, 1)
      
      // Mark both as in call
      user.inCall = true
      partner.inCall = true

      // Notify both users
      io.to(userId).emit('partner-found', {
        peerId: partner.peerId,
        username: partner.username
      })
      
      io.to(partnerId).emit('partner-found', {
        peerId: user.peerId,
        username: user.username
      })

      return true
    }

    return false
  }

  socket.on('find-partner', () => {
    const user = activeUsers.get(socket.id)
    if (!user || user.inCall || !user.peerId) return

    // Remove from waiting if already waiting
    const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
    if (waitingIndex !== -1) {
      waitingQueue.splice(waitingIndex, 1)
    }

    // Try to find a match
    const matched = findMatchForUser(socket.id)
    
    // If no match found, add to waiting queue
    if (!matched) {
      waitingQueue.push(socket.id)
      socket.emit('waiting-for-partner')
    }
  })

  socket.on('end-call', (partnerId) => {
    const user = activeUsers.get(socket.id)
    if (user) {
      user.inCall = false
      
      // Notify the partner that call has ended
      if (partnerId) {
        const partner = activeUsers.get(partnerId)
        if (partner) {
          partner.inCall = false
          io.to(partnerId).emit('call-ended', socket.id)
        }
      }

      // Automatically try to find a new partner
      findMatchForUser(socket.id) || socket.emit('waiting-for-partner')
    }
  })

  socket.on('leave-chat', () => {
    const user = activeUsers.get(socket.id)
    if (user) {
      // Remove from waiting queue if present
      const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
      if (waitingIndex !== -1) {
        waitingQueue.splice(waitingIndex, 1)
      }
      
      // If in call, notify partner
      if (user.inCall) {
        // Find and notify partner
        const partner = Array.from(activeUsers.entries())
          .find(([id, u]) => u.inCall && id !== socket.id)
        
        if (partner) {
          const [partnerId, partnerUser] = partner
          partnerUser.inCall = false
          io.to(partnerId).emit('partner-left')
        }
      }
      
      // Clear user state but keep in active users
      user.inCall = false
      user.peerId = null
    }
  })

  socket.on('disconnect', () => {
    const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
    if (waitingIndex !== -1) {
      waitingQueue.splice(waitingIndex, 1)
    }
    activeUsers.delete(socket.id)
    io.emit('online-users', activeUsers.size)
  })
})

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`)
  console.log(`- Local: http://localhost:${PORT}`)
  console.log(`- Network: http://${LOCAL_IP}:${PORT}`)
  console.log(`PeerJS server running on port 9000`)
})

// ... rest of the server code ... 