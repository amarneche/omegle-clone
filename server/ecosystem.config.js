require('dotenv').config()

module.exports = {
  apps: [{
    name: 'random-chat-server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT
    }
  }]
} 