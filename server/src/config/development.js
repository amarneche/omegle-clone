require('dotenv').config({ path: '.env.development' })

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },

  webrtc: {
    stunServers: JSON.parse(process.env.STUN_SERVERS || '[]'),
    turnServer: process.env.TURN_SERVER_URL ? {
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_PASSWORD
    } : null
  },

  security: {
    sessionSecret: process.env.SESSION_SECRET,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
    },
    maxConnectionsPerIP: parseInt(process.env.MAX_CONNECTIONS_PER_IP) || 50
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  }
} 