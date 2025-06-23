const net = require('node:net')
const log = require('../utils/logger')
const { ASTM } = require('./utils')

// Simple TCP Reverse Proxy
// Accepts connections from LIS and forwards to equipment
const createReverseProxy = (config) => {
  const server = net.createServer((lisSocket) => {
    log.info(`LIS connected: ${lisSocket.remoteAddress}`)

    // Connect to equipment server
    const equipmentSocket = net.createConnection({
      host: config.equipmentHost,
      port: config.equipmentPort
    }, () => {
      log.debug(`Connected to equipment at ${config.equipmentHost}:${config.equipmentPort}`)
    })

    // Forward data from equipment to LIS
    equipmentSocket.on('data', (data) => {
      log.debug('Forwarding data from equipment to LIS')

      // Handle ASTM handshake
      if (data[0] === ASTM.ENQ) {
        log.debug('Received ENQ from equipment, sending ACK to LIS')
        lisSocket.write(Buffer.from([ASTM.ACK]))
      }

      else {
        lisSocket.write(data)
      }
    })

    // Forward data from LIS to equipment
    lisSocket.on('data', (data) => {
      log.debug('Forwarding data from LIS to equipment')
      equipmentSocket.write(data)
    })

    // Handle LIS disconnect
    lisSocket.on('close', () => {
      log.info('LIS disconnected')
      equipmentSocket.end()
    })

    // Handle equipment disconnect
    equipmentSocket.on('close', () => {
      log.info('Equipment disconnected')
      lisSocket.end()
    })

    // Handle errors
    lisSocket.on('error', (err) => {
      log.error('LIS socket error:', err.message)
      equipmentSocket.destroy()
    })

    equipmentSocket.on('error', (err) => {
      log.error('Equipment socket error:', err.message)
      lisSocket.destroy()
    })
  })

  return server
}

// Start reverse proxy server
const startReverseProxy = (config) => {
  return new Promise((resolve, reject) => {
    const server = createReverseProxy(config)

    server.listen(config.proxyPort, (err) => {
      if (err) {
        reject(err)
      } else {
        log.info(`Reverse proxy listening on port ${config.proxyPort}`)
        log.info(`Forwarding LIS connections to ${config.equipmentHost}:${config.equipmentPort}`)
        resolve(server)
      }
    })

    server.on('error', (err) => {
      log.error('Reverse proxy server error:', err.message)
      reject(err)
    })
  })
}

module.exports = startReverseProxy
