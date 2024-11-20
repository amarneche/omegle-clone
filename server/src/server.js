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
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const LOCAL_IP = getLocalIP()
const PORT = process.env.PORT || 3000

// Configure CORS for both Express and Socket.IO
app.use(cors({
  origin: '*', // In production, you should specify exact origins
  methods: ['GET', 'POST']
}))

const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify exact origins
    methods: ["GET", "POST"]
  }
})

const activeUsers = new Map()
const waitingUsers = new Set()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  io.emit('online-users', activeUsers.size)

  socket.on('set-username', (username) => {
    activeUsers.set(socket.id, {
      username,
      inCall: false,
      mood: {
        type: 'casual',
        tags: []
      },
      preferences: {
        language: 'any'
      }
    })
    io.emit('online-users', activeUsers.size)
  })

  socket.on('update-mood', ({ mood, preferences }) => {
    const user = activeUsers.get(socket.id)
    if (user) {
      user.mood = mood
      user.preferences = preferences
    }
  })

  socket.on('find-partner', () => {
    const user = activeUsers.get(socket.id)
    if (!user || user.inCall) return

    // Find a compatible partner
    const partner = Array.from(waitingUsers).find(id => {
      const potentialPartner = activeUsers.get(id)
      if (!potentialPartner || id === socket.id) return false

      // Check mood compatibility
      const moodMatch = user.mood.type === potentialPartner.mood.type
      
      // Check language preference
      const languageMatch = 
        user.preferences.language === 'any' || 
        potentialPartner.preferences.language === 'any' ||
        user.preferences.language === potentialPartner.preferences.language

      return moodMatch && languageMatch
    })

    if (partner) {
      waitingUsers.delete(partner)
      
      // Mark both users as in call
      activeUsers.get(socket.id).inCall = true
      activeUsers.get(partner).inCall = true

      // Notify both users about the match
      io.to(socket.id).emit('partner-found', {
        partnerId: partner,
        username: activeUsers.get(partner).username
      })
      io.to(partner).emit('partner-found', {
        partnerId: socket.id,
        username: user.username
      })

      console.log(`Matched ${socket.id} with ${partner}`)
    } else {
      waitingUsers.add(socket.id)
      console.log(`Added ${socket.id} to waiting list`)
    }
  })

  socket.on('offer', ({ offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`)
    socket.to(to).emit('offer', { offer, from: socket.id })
  })

  socket.on('answer', ({ answer, to }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`)
    socket.to(to).emit('answer', { answer, from: socket.id })
  })

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log(`Sending ICE candidate from ${socket.id} to ${to}`)
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id })
  })

  socket.on('end-call', () => {
    const user = activeUsers.get(socket.id)
    if (user) {
      user.inCall = false
      waitingUsers.delete(socket.id)
      // Notify other users that call has ended
      socket.broadcast.emit('call-ended', socket.id)
    }
  })

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id)
    if (user && user.inCall) {
      // Notify others if user was in a call
      socket.broadcast.emit('call-ended', socket.id)
    }
    waitingUsers.delete(socket.id)
    activeUsers.delete(socket.id)
    io.emit('online-users', activeUsers.size)
  })
})

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`)
  console.log(`- Local: http://localhost:${PORT}`)
  console.log(`- Network: http://${LOCAL_IP}:${PORT}`)
}) 