const net = require('node:net')
const log = require('../utils/logger')

// Simple TCP Forward Proxy
// Forwards connections from clients to a target LIS server
const createForwardProxy = (config) => {
  const server = net.createServer((clientSocket) => {
    log.info(`Client connected: ${clientSocket.remoteAddress}`)

    // Connect to target LIS server
    const targetSocket = net.createConnection({
      host: config.lisHost,
      port: config.lisPort
    }, () => {
      log.debug(`Connected to LIS server at ${config.lisHost}:${config.lisPort}`)
    })

    // Forward data from target to client
    targetSocket.on('data', (data) => {
      log.debug('Forwarding data from LIS to client')
      clientSocket.write(data)
    })

    // Forward data from client to target
    clientSocket.on('data', (data) => {
      log.debug('Forwarding data from client to LIS')
      targetSocket.write(data)
    })

    // Handle client disconnect
    clientSocket.on('close', () => {
      log.info('Client disconnected')
      targetSocket.end()
    })

    // Handle target disconnect
    targetSocket.on('close', () => {
      log.info('LIS server disconnected')
      clientSocket.end()
    })

    // Handle errors
    clientSocket.on('error', (err) => {
      log.error('Client socket error:', err.message)
      targetSocket.destroy()
    })

    targetSocket.on('error', (err) => {
      log.error('Target socket error:', err.message)
      clientSocket.destroy()
    })
  })

  return server
}

module.exports = createForwardProxy
