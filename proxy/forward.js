/**
 * @fileoverview TCP Forward Proxy implementation
 * This module creates a forward proxy server that accepts client connections
 * and forwards them to a target LIS (Laboratory Information System) server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../utils/logger')

/**
 * Creates a TCP forward proxy server
 * The forward proxy accepts connections from clients and forwards all traffic
 * to the configured LIS server, acting as an intermediary.
 *  * @function createForwardProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {string} config.lisHost - Hostname of the target LIS server
 * @param {number} config.lisPort - Port number of the target LIS server
 * @returns {import('net').Server} TCP server instance configured as forward proxy
 */
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
      try {
        clientSocket.write(data)
      } catch (error) {
        log.error('Error forwarding LIS data to client:', error.message)
        return
      }
    })

    // Forward data from client to target
    clientSocket.on('data', (data) => {
      log.debug('Forwarding data from client to LIS')
      try {
        targetSocket.write(data)
      } catch (error) {
        log.error('Error processing client data:', error.message)
        return
      }
    })

    // Handle client disconnect
    clientSocket.on('close', () => {
      log.info('Client disconnected')
    })

    // Handle target disconnect
    targetSocket.on('close', () => {
      log.info('LIS server disconnected')
      targetSocket.end()
    })

    // Handle errors
    clientSocket.on('error', (err) => {
      log.error('Client socket error:', err.message)
    })

    targetSocket.on('error', (err) => {
      log.error('Target socket error:', err.message)
    })
  })

  return server
}

/**
 * Starts the forward proxy server and binds it to the configured port
 *
 * @async
 * @function startForwardProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {number} config.proxyPort - Port number for the proxy server to listen on
 * @param {string} config.lisHost - Hostname of the target LIS server
 * @param {number} config.lisPort - Port number of the target LIS server
 * @returns {Promise<import('net').Server>} Promise that resolves to the started server instance
 * @throws {Error} If server fails to start or bind to port
 */
const startForwardProxy = (config) => {
  return new Promise((resolve, reject) => {
    const server = createForwardProxy(config)

    server.listen(config.proxyPort, (err) => {
      if (err) {
        reject(err)
      } else {
        log.info(`Forward proxy listening on port ${config.proxyPort}`)
        log.info(`Forwarding client connections to ${config.lisHost}:${config.lisPort}`)
        resolve(server)
      }
    })

    server.on('error', (err) => {
      log.error('Forward proxy server error:', err.message)
      reject(err)
    })
  })
}

module.exports = startForwardProxy
