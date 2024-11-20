const express = require('express')
const { createServer } = require('https')
const { Server } = require('socket.io')
const cors = require('cors')
const fs = require('fs')
const config = require('./config/production')

const app = express()

// SSL configuration
const httpsServer = createServer({
  key: fs.readFileSync(config.security.sslKey),
  cert: fs.readFileSync(config.security.sslCert)
}, app)

// Security middleware
app.use(cors(config.cors))
app.use(require('helmet')())
app.use(require('compression')())

const io = new Server(httpsServer, {
  cors: config.cors,
  pingTimeout: 60000,
  pingInterval: 25000
})

// Rest of your server code...

module.exports = httpsServer 