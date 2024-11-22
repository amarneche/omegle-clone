const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const httpServer = createServer(app)
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

// State management
const activeUsers = new Map()
const waitingQueue = []

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Socket.IO error handling
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err)
})

const findMatch = (userId) => {
  const user = activeUsers.get(userId)
  if (!user || user.inCall || !user.peerId) return false

  // Remove user from waiting queue if they're in it
  const userWaitingIndex = waitingQueue.findIndex(id => id === userId)
  if (userWaitingIndex !== -1) {
    waitingQueue.splice(userWaitingIndex, 1)
  }

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
    
    waitingQueue.splice(partnerIndex, 1)
    
    user.inCall = true
    partner.inCall = true

    // Emit match_found to both users with full user info
    io.to(userId).emit('match_found', {
      peerId: partner.peerId,
      username: partner.username,
      mood: partner.mood,
      preferences: partner.preferences,
      isCameraOn: partner.isCameraOn,
      isMicOn: partner.isMicOn
    })
    
    io.to(partnerId).emit('match_found', {
      peerId: user.peerId,
      username: user.username,
      mood: user.mood,
      preferences: user.preferences,
      isCameraOn: user.isCameraOn,
      isMicOn: user.isMicOn
    })

    return true
  }
  return false
}

io.on('connection', (socket) => {
  // Start chat session
  socket.on('start', (userInfo) => {
    if (!activeUsers.has(socket.id)) {
      activeUsers.set(socket.id, {
        ...userInfo,
        inCall: false,
        socketId: socket.id
      })
    }
    io.emit('online_users_update', activeUsers.size)
    
    const matched = findMatch(socket.id)
    if (!matched) {
      waitingQueue.push(socket.id)
    }
  })

  // Handle skip request
  socket.on('skip', () => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      
      if (partner) {
        const [partnerId] = partner
        io.to(partnerId).emit('peer_skipped')
        partner[1].inCall = false
        user.inCall = false
        
        // Automatically try to find new matches for both users
        const matchedUser = findMatch(socket.id)
        if (!matchedUser) {
          waitingQueue.push(socket.id)
        }

        const matchedPartner = findMatch(partnerId)
        if (!matchedPartner) {
          waitingQueue.push(partnerId)
        }
      }
    }
  })

  // Handle media toggles
  socket.on('toggle_camera', (status) => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      if (partner) {
        io.to(partner[0]).emit('toggle_camera_status', status)
      }
    }
  })

  socket.on('toggle_microphone', (status) => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      if (partner) {
        io.to(partner[0]).emit('toggle_microphone_status', status)
      }
    }
  })

  // Handle messages
  socket.on('send_message', (message) => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      if (partner) {
        io.to(partner[0]).emit('message_received', {
          text: message,
          sender: user.username
        })
      }
    }
  })

  // Handle user info updates
  socket.on('update_info', (userInfo) => {
    const user = activeUsers.get(socket.id)
    if (user) {
      activeUsers.set(socket.id, { ...user, ...userInfo })
    }
  })

  // Handle disconnect request
  socket.on('disconnect_request', () => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      if (partner) {
        io.to(partner[0]).emit('call_disconnected')
        partner[1].inCall = false
      }
    }
    
    const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
    if (waitingIndex !== -1) {
      waitingQueue.splice(waitingIndex, 1)
    }
    
    if (user) {
      user.inCall = false
      user.peerId = null
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id)
    if (user?.inCall) {
      const partner = Array.from(activeUsers.entries())
        .find(([id, u]) => u.inCall && id !== socket.id)
      if (partner) {
        io.to(partner[0]).emit('call_disconnected')
        partner[1].inCall = false
      }
    }

    const waitingIndex = waitingQueue.findIndex(id => id === socket.id)
    if (waitingIndex !== -1) {
      waitingQueue.splice(waitingIndex, 1)
    }

    activeUsers.delete(socket.id)
    io.emit('online_users_update', activeUsers.size)
  })
})

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`)
})


