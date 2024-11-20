module.exports = {
  cors: {
    origin: ['https://your-production-domain.com'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  security: {
    ssl: true,
    sslKey: '/path/to/your/privkey.pem',
    sslCert: '/path/to/your/fullchain.pem'
  },
  turnServers: [
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
} 