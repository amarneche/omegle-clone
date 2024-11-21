const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
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

// Add more detailed logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Enhance Socket.IO logging
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err)
})

io.on('connection', (socket) => {
  console.log(`${new Date().toISOString()} - New socket connection:`, {
    socketId: socket.id,
    transport: socket.conn.transport.name,
    remoteAddress: socket.handshake.address,
    headers: socket.handshake.headers['x-forwarded-for'] || socket.handshake.address
  })
  
  socket.on('set-username', (username) => {
    console.log(`${new Date().toISOString()} - User ${socket.id} set username:`, username)
    activeUsers.set(socket.id, {
      username,
      peerId: null,
      inCall: false,
      mood: { type: 'casual', tags: [] },
      preferences: { language: 'any' }
    })
    io.emit('online-users', activeUsers.size)
    console.log('Active users count:', activeUsers.size)
  })

  socket.on('register-peer', (peerId) => {
    console.log(`${new Date().toISOString()} - User ${socket.id} registered peer:`, peerId)
    const user = activeUsers.get(socket.id)
    if (user) {
      user.peerId = peerId
      console.log('Updated user data:', user)
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
    console.log(`${new Date().toISOString()} - User ${socket.id} requesting partner`)
    const user = activeUsers.get(socket.id)
    if (!user || user.inCall || !user.peerId) {
      console.log('Cannot find partner:', { 
        userExists: !!user, 
        inCall: user?.inCall, 
        hasPeerId: user?.peerId 
      })
      return
    }

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
    console.log(`${new Date().toISOString()} - User disconnected:`, socket.id)
    const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
    if (waitingIndex !== -1) {
      waitingQueue.splice(waitingIndex, 1)
    }
    activeUsers.delete(socket.id)
    io.emit('online-users', activeUsers.size)
    console.log('Active users after disconnect:', activeUsers.size)
  })
})

// Enhanced server startup logging
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('=================================')
  console.log(`${new Date().toISOString()} - Server started`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Port: ${PORT}`)
  console.log(`Local IP: ${LOCAL_IP}`)
  console.log('Socket.IO CORS config:', io.opts.cors)
  console.log('=================================')
})

// Add error handling for the HTTP server
httpServer.on('error', (error) => {
  console.error('HTTP Server error:', error)
})

// ... rest of the server code ... 