/**
 * @fileoverview TCP Forward Proxy implementation
 * This module creates a forward proxy server that accepts client connections
 * and forwards them to a target LIS (Laboratory Information System) server.
 */

const net = require('node:net')
const config = require('../config')
const log = require('../shared/logger')
const { handleBuffer } = require('../handlers/hl7/helpers/handle-buffer')

/**
 * Create and manage persistent connection to LIS server with auto-reconnect
 */

const createLISConnection = (config, clientSocket) => {
  let targetSocket
  let reconnectTimer
  let isConnecting = false

  const cleanup = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
    isConnecting = false
  }

  const destroyConnection = () => {
    cleanup()
    if (targetSocket && !targetSocket.destroyed) {
      targetSocket.destroy()
    }
  }

  const scheduleReconnect = () => {
    if (clientSocket?.destroyed || reconnectTimer || isConnecting) return

    log.debug('ForwardProxy -> Scheduling LIS reconnection in 10 seconds')
    reconnectTimer = setTimeout(connect, 10000)
  }

  const setupTargetSocketHandlers = (socket) => {
    socket.on('connect', () => {
      log.debug(`ForwardProxy -> Connected to LIS server at ${config.lisHost}:${config.lisPort}`)
      cleanup()
    })

    socket.on('data', (data) => {

      handleBuffer(data, clientSocket)

      log.debug(`ForwardProxy -> Forward from Lis ${clientSocket.address().address} to Client at ${socket.address().address}`)
    })

    socket.on('close', () => {
      log.debug('ForwardProxy -> LIS server disconnected')
      scheduleReconnect()
    })

    socket.on('error', (err) => {
      log.error('LIS connection error:', err)
      scheduleReconnect()
    })
  }

  const connect = () => {
    if (isConnecting || clientSocket?.destroyed) return targetSocket

    isConnecting = true

    log.debug('ForwardProxy -> Attempting to connect to LIS')

    targetSocket = net.createConnection({
      host: config.lisHost,
      port: config.lisPort
    })

    setupTargetSocketHandlers(targetSocket)
    return targetSocket
  }

  clientSocket.once('close', destroyConnection)
  clientSocket.once('error', destroyConnection)

  return connect()
}

/**
 * Forward client data to target LIS server
 */
const forwardToTarget = (data, targetSocket, clientSocket) => {

  if (!targetSocket || targetSocket.destroyed) {
    log.warn('ForwardProxy -> Cannot forward data: target socket unavailable')
    return createLISConnection(config, clientSocket)
  }

  try {

    targetSocket.write(data)

    log.debug(`ForwardProxy -> Forward from Client ${clientSocket.address().address} to Lis at ${targetSocket.address().address}`)
  } catch (error) {
    log.error('ForwardProxy -> Error forwarding client data:', error)
  }

  return targetSocket
}

/**
 * Handle client connection
 */
const handleClientConnection = (clientSocket) => {
  const clientIP = clientSocket.remoteAddress || 'unknown'

  log.debug(`ForwardProxy -> Client connected: ${clientIP}`)

  let targetSocket = createLISConnection(config, clientSocket)

  const handleClientData = (data) => {

    targetSocket = forwardToTarget(data, targetSocket, clientSocket)
  }

  clientSocket.on('data', handleClientData)

  clientSocket.on('close', () => log.debug('ForwardProxy -> Client disconnected'))

  clientSocket.on('error', (err) => {
    log.error('Client error:', err.message)
    clientSocket.destroy()
  })
}

/**
 * Start forward proxy server
 */
const startForwardProxy = (config) => {
  const server = net.createServer(handleClientConnection)

  server.on('error', (err) => {
    log.error('ForwardProxy -> Proxy server error:', err.message)
  })

  server.listen(config.proxyPort, () => {
    log.debug('ForwardProxy -> Waiting for connections...')
  })

  return server
}

module.exports = { startForwardProxy }
