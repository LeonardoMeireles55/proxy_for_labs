/**
 * @fileoverview TCP Forward Proxy implementation
 * This module creates a forward proxy server that accepts client connections
 * and forwards them to a target LIS (Laboratory Information System) server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../helpers/logging/logger')
const config = require('../config')
const fs = require('node:fs')

const { parseMessage, HL7toJson, getInformationBySegmentType, extractLabValues  } = require('../helpers/libs/hl7-lib')



const saveAsFile = (data) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `message_${timestamp}`

  const filePath = `./debug/${filename}.json`

  fs.mkdirSync('./debug', { recursive: true })

  fs.writeFileSync(filePath, data, { encoding: 'utf8' })

  log.info(`Data saved to ${filePath}`)
}

/**
 * Creates a connection to the LIS server with automatic reconnection
 * @param {Object} config - Configuration object
 * @param {net.Socket} clientSocket - Client socket to forward data to
 * @returns {net.Socket} Target socket connection
 */
const createLISConnection = (config, clientSocket) => {

  let targetSocket
  let reconnectTimer

  const connect = () => {
    targetSocket = net.createConnection({
      host: config.lisHost,
      port: config.lisPort
    })

    targetSocket.on('connect', () => {
      log.info(`ForwardProxy -> connected to LIS server at ${config.lisHost}:${config.lisPort}`)
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    })



    targetSocket.on('data', (data) => {
      log.info('ForwardProxy -> forwarding data from LIS to client')
      try {
        if (clientSocket && !clientSocket.destroyed) {
          clientSocket.write(data)
        }
      } catch (error) {
        log.error('ForwardProxy -> error forwarding LIS data to client:', error)
      }
    })

    targetSocket.on('close', () => {
      log.info('LIS server disconnected')
      scheduleReconnect()
    })

    targetSocket.on('error', (err) => {
      log.error('ForwardProxy -> target socket error:', err)
      scheduleReconnect()
    })

    return targetSocket
  }

  const scheduleReconnect = () => {
    if (clientSocket && !clientSocket.destroyed && !reconnectTimer) {
      log.info('ForwardProxy -> scheduling LIS reconnection in 5 seconds...')
      reconnectTimer = setTimeout(() => {
        log.info('ForwardProxy -> attempting to reconnect to LIS server...')
        connect()
      }, 5000)
    }
  }

  // Handle client disconnect to clean up reconnection timer
  clientSocket.on('close', () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (targetSocket && !targetSocket.destroyed) {
      targetSocket.destroy()
    }
  })

  return connect()
}

/**
 * Creates a TCP forward proxy server
 * The forward proxy accepts connections from clients and forwards all traffic
 * to the configured LIS server, acting as an intermediary.
 * @function createForwardProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {string} config.lisHost - Hostname of the target LIS server
 * @param {number} config.lisPort - Port number of the target LIS server
 * @returns {import('net').Server} TCP server instance configured as forward proxy
 */
const createForwardProxy = (config) => {
  const server = net.createServer((clientSocket) => {
    const CLIENT_IP = clientSocket.remoteAddress || 'unknown IP'

    log.info(`ForwardProxy -> client connected: ${CLIENT_IP}`)

    const targetSocket = createLISConnection(config, clientSocket)

    server.on('close', () => {
      targetSocket.end()
      log.info('ForwardProxy -> server closed, target socket ended')
      clientSocket.end()
      log.info('ForwardProxy -> client socket ended')
    })

    // Forward data from client to target
    clientSocket.on('data', (data) => {
      log.info('ForwardProxy -> forwarding data from client to LIS')
      log.info(`ForwardProxy -> data length: ${data.length} bytes`)


      const parsedMessage = parseMessage(data)

      const jsonMessage = HL7toJson(data)

      const extractedLabValues = extractLabValues(data)

      if (parsedMessage) {

        saveAsFile(JSON.stringify(extractedLabValues, null, 2))

        const text = parsedMessage.toString()

        log.info(`ForwardProxy -> parsed message: ${parsedMessage}`)
        log.debug(`ForwardProxy -> json message: ${(JSON.stringify(jsonMessage, null, 2))}`)
        log.debug(`ForwardProxy -> raw text values: ${text}`)
      }


      try {
        if (targetSocket && !targetSocket.destroyed) {
          targetSocket.write(data)
        }
      } catch (error) {
        log.error('ForwardProxy -> error processing client data:', error)
      }
    })


    // Handle client disconnect
    clientSocket.on('close', () => {
      log.info('ForwardProxy -> client disconnected')
    })

    // Handle client errors
    clientSocket.on('error', (err) => {
      log.error('ForwardProxy -> client socket error:', err)
      clientSocket.end()
    })
  })

  return server
}

/**
 * Starts the forward proxy server and binds it to the configured port
 *
 * @function startForwardProxy
 * @param {Object} config - Configuration object containing server settings
 * @param {number} config.proxyPort - Port number for the proxy server to listen on
 * @param {string} config.lisHost - Hostname of the target LIS server
 * @param {number} config.lisPort - Port number of the target LIS server
 * @throws {Error} If server fails to start or bind to port
 */
const startForwardProxy = (config) => {
  const server = createForwardProxy(config)

  server.listen(config.proxyPort, () => {
    log.info(`Forward proxy listening on port ${config.proxyPort}`)
    log.info(`Waiting connections...`)
  })

  server.on('error', (err) => {
    log.error('ForwardProxy -> server error:', err)
  })

  return server
}

module.exports = startForwardProxy
