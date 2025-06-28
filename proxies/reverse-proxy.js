/**
 * @fileoverview TCP Reverse Proxy implementation
 * This module creates a reverse proxy server that accepts connections from LIS
 * and forwards them to laboratory equipment, handling ASTM protocol handshakes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../shared/logger')

/**
 * Creates a TCP reverse proxy server
 * The reverse proxy accepts connections from LIS and forwards traffic to equipment,
 * with special handling for ASTM protocol control characters.
 *
 * @function reverseProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {string} config.equipmentHost - Hostname of the target equipment server
 * @param {number} config.equipmentPort - Port number of the target equipment server
 * @returns {import('net').Server} TCP server instance configured as reverse proxy
 */
const reverseProxy = (config) => {
  const server = net.createServer((lisSocket) => {
    log.debug(`ReverseProxy -> LIS connected: ${lisSocket.remoteAddress}`)

    // Connect to equipment server
    const equipmentSocket = net.createConnection({
      host: config.equipmentHost,
      port: config.equipmentPort
    }, () => {
      log.debug(`ReverseProxy -> Connected to equipment at ${config.equipmentHost}:${config.equipmentPort}`)
    })

    // Forward data from equipment to LIS
    equipmentSocket.on('data', (data) => {
      log.debug('ReverseProxy -> Forwarding data from equipment to LIS')
        lisSocket.write(data)
    })

    // Forward data from LIS to equipment
    lisSocket.on('data', (data) => {
      log.debug('ReverseProxy -> Forwarding data from LIS to equipment')
      equipmentSocket.write(data)
    })

    // Handle LIS disconnect
    lisSocket.on('close', () => {
      log.debug('ReverseProxy -> LIS disconnected')
      equipmentSocket.end()
    })

    // Handle equipment disconnect
    equipmentSocket.on('close', () => {
      log.debug('ReverseProxy -> Equipment disconnected')
      lisSocket.end()
    })

    // Handle errors
    lisSocket.on('error', (err) => {
      log.error('ReverseProxy -> LIS socket error:', err)
      equipmentSocket.destroy()
    })

    equipmentSocket.on('error', (err) => {
      log.error('ReverseProxy -> Equipment socket error:', err)
      lisSocket.destroy()
    })
  })

  return server
}

/**
 * Starts the reverse proxy server and binds it to the configured port
 *
 * @async
 * @function startReverseProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {number} config.proxyPort - Port number for the proxy server to listen on
 * @param {string} config.equipmentHost - Hostname of the target equipment server
 * @param {number} config.equipmentPort - Port number of the target equipment server
 * @returns {Promise<import('net').Server>} Promise that resolves to the started server instance
 * @throws {Error} If server fails to start or bind to port
 */
const startReverseProxy = (config) => {
  return new Promise((resolve, reject) => {
    const server = reverseProxy(config)

    server.listen(config.proxyPort, (err) => {
      if (err) {
        reject(err)
      } else {
        log.debug(`ReverseProxy -> Listening on port ${config.proxyPort}`)
        log.debug(`ReverseProxy -> Forwarding LIS connections to ${config.equipmentHost}:${config.equipmentPort}`)
        resolve(server)
      }
    })

    server.on('error', (err) => {
      log.error('ReverseProxy -> Server error:', err.message)
      reject(err)
    })
  })
}

module.exports = { startReverseProxy }
