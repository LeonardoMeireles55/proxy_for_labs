/**
 * @fileoverview TCP Forward Proxy implementation
 * This module creates a forward proxy server that accepts client connections
 * and forwards them to a target LIS (Laboratory Information System) server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const fs = require('node:fs')
const config = require('../config')
const { createAcknowledgment } = require('../simulators/hl-7/messages')
const log = require('../libs/shared/logger')
const { extractAndConvertToJsonObject } = require('../libs/hl7/helpers/convert-to-qc-json-object')
const { extractCompleteHL7Data, removeMllpFraming, parseMshSegment } = require('../libs/hl7')


// Constants
let messageBuffer = Buffer.alloc(0)
const messageEnd = Buffer.from([0x1C, 0x0D]) // MLLP end sequence: FS + CR
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

/**
 * Validate if data is meaningful for saving
 * @param {*} data - Data to validate
 * @returns {boolean} True if data is valid
 */
const isValidData = (data) => {
  if (!data) return false

  if (Array.isArray(data)) {
    return data.length > 0
  }

  if (typeof data === 'object') {
    return Object.keys(data).length > 0
  }

  if (Buffer.from(data).byteLength > 2) {
    log.warn('Data is too short to be a valid HL7 message')
    return true
  }

  return false
}

/**
 * Save data to debug file with timestamp
 * @param {string} data - JSON string data to save
 */
const saveAsFile = (data) => {
  if (!data || !isValidData(data)) {
    log.warn('No valid data to save, skipping file creation')
    return
  }

  const filePath = `./debug/message_${timestamp}.json`
  fs.mkdirSync('./debug', { recursive: true })
  fs.writeFileSync(filePath, data, { encoding: 'utf8' })
  log.info(`Data saved to ${filePath}`)
}

/**
 * Process complete HL7 message and send acknowledgment
 * @param {Buffer} message - Complete HL7 message with MLLP framing
 * @param {net.Socket} clientSocket - Client socket for sending acknowledgment
 */
const processHL7Message = (message, clientSocket) => {
  log.info('Processing complete HL7 message')

  // Send HL7 acknowledgment
  sendHL7Acknowledgment(message, clientSocket)

  // Extract and process HL7 data
  const extractedData = extractCompleteHL7Data(message)
  const analyticsData = extractAndConvertToJsonObject(extractedData)

  // Save extracted HL7 data
  if (extractedData) {
    saveAsFile(JSON.stringify(extractedData, null, 2))
  } else {
    log.warn('No valid HL7 data extracted from message')
    return
  }

  // Save analytics data
  if (analyticsData) {
    saveAsFile(JSON.stringify(analyticsData, null, 2))
  } else {
    log.warn('No valid analytics data extracted from HL7 message')
  }

  log.debug('HL7 message processed successfully')
}

/**
 * Send HL7 acknowledgment message to client
 * @param {Buffer} originalMessage - Original HL7 message
 * @param {net.Socket} clientSocket - Client socket
 */
const sendHL7Acknowledgment = (originalMessage, clientSocket) => {
  try {
    // Convert message to string for parsing
    const messageStr = originalMessage.toString('utf8')
    log.debug('Raw message for parsing:', messageStr.substring(0, 200) + '...')

    // Remove MLLP framing characters (VT start, FS+CR end)
    const cleanMessage = removeMllpFraming(messageStr)

    // Parse MSH segment to extract required fields
    const { messageControlId, triggerEvent } = parseMshSegment(cleanMessage)

    // Create and send acknowledgment (AA = Application Accept)
    const ack = createAcknowledgment('AA', messageControlId, 'P', '2.5.1', triggerEvent)

    clientSocket.write(ack)

    log.debug('Sent HL7 acknowledgment with trigger event:', triggerEvent)
  } catch (error) {
    log.error('Error sending acknowledgment:', error.message)
  }
}

/**
 * Forward client data to target LIS server
 * @param {Buffer} data - Data to forward
 * @param {net.Socket} targetSocket - Target LIS socket
 * @param {net.Socket} clientSocket - Client socket for reconnection
 * @returns {net.Socket} Socket connection
 */
const forwardToTarget = (data, targetSocket, clientSocket) => {
  if (!targetSocket || targetSocket.destroyed) {
    log.warn('Cannot forward data: target socket unavailable')
    return createLISConnection(config, clientSocket)
  }

  try {
    // Forward data to LIS
    // targetSocket.write(data)
    log.debug('Forwarded data from client to LIS')
  } catch (error) {
    log.error('Error forwarding client data:', error)
  }

  return targetSocket;
}

/**
 * Create and manage persistent connection to LIS server with auto-reconnect
 * @param {Object} config - Configuration object
 * @param {net.Socket} clientSocket - Client socket reference
 * @returns {net.Socket} LIS connection socket
 */
const createLISConnection = (config, clientSocket) => {
  let targetSocket
  let reconnectTimer
  let isConnecting = false

  // Clean up timers and flags
  const cleanup = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    isConnecting = false
  }

  // Schedule reconnection attempt after delay
  const scheduleReconnect = () => {
    if (clientSocket?.destroyed || reconnectTimer || isConnecting) return

    log.info('Scheduling LIS reconnection in 5 seconds')
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, 5000)
  }

  // Set up event handlers for target socket
  const setupTargetSocketHandlers = (socket) => {
    socket.on('connect', () => {
      log.info(`Connected to LIS server at ${config.lisHost}:${config.lisPort}`)
      cleanup()
    })

    // Handle incoming data from LIS server
    socket.on('data', (data) => {
      if (clientSocket?.destroyed) return

      // Buffer incoming data for complete message detection
      messageBuffer = Buffer.concat([messageBuffer, data])
      const endIndex = messageBuffer.indexOf(messageEnd)

      // Process complete messages
      if (endIndex !== -1) {
        const completeMessage = messageBuffer.slice(0, endIndex + 2)
        messageBuffer = messageBuffer.slice(endIndex + 2)
        processHL7Message(completeMessage, clientSocket)
      }

      try {
        // Forward data to client
        // clientSocket.write(data)
        log.debug('Forwarded data from LIS to client')
      } catch (error) {
        log.error('Error forwarding LIS data:', error)
      }
    })

    socket.on('close', () => {
      log.info('LIS server disconnected')
      scheduleReconnect()
    })

    socket.on('error', (err) => {
      log.error('LIS connection error:', err)
      scheduleReconnect()
    })
  }

  // Establish connection to LIS server
  const connect = () => {
    if (isConnecting || clientSocket?.destroyed) {
      // Return existing socket or create a new one if needed
      return targetSocket || net.createConnection({
        host: config.lisHost,
        port: config.lisPort
      })
    }

    isConnecting = true
    log.info('Attempting to reconnect to LIS')

    targetSocket = net.createConnection({
      host: config.lisHost,
      port: config.lisPort
    })

    setupTargetSocketHandlers(targetSocket)
    return targetSocket
  }

  // Clean up when client disconnects
  clientSocket.on('close', () => {
    cleanup()
    if (targetSocket && !targetSocket.destroyed) {
      targetSocket.destroy()
    }
  })

  return connect()
}

/**
 * Create forward proxy server
 * @param {Object} config - Configuration object
 * @returns {net.Server} TCP server instance
 */
const createForwardProxy = (config) => {
  const server = net.createServer()

  // Handle client connections
  server.on('connection', (clientSocket) => {
    const clientIP = clientSocket.remoteAddress || 'unknown'
    log.info(`Client connected: ${clientIP}`)

    // Initialize LIS connection
    let currentTargetSocket
    const lisConnection = createLISConnection(config, clientSocket)
    currentTargetSocket = lisConnection

    const getTargetSocket = () => currentTargetSocket

    // Handle incoming data from client
    const handleClientData = (data) => {
      log.info('Received data from client')

      // Forward to LIS
      forwardToTarget(data, getTargetSocket(), clientSocket)

      // Buffer incoming data for complete message detection
      messageBuffer = Buffer.concat([messageBuffer, data])
      const endIndex = messageBuffer.indexOf(messageEnd)

      // Process complete HL7 messages
      if (endIndex !== -1) {
        const completeMessage = messageBuffer.slice(0, endIndex + 2)
        messageBuffer = messageBuffer.slice(endIndex + 2)
        processHL7Message(completeMessage, clientSocket)
      }
    }

    // Set up client socket event handlers
    clientSocket.on('data', handleClientData)
    clientSocket.on('close', () => log.info('Client disconnected'))
    clientSocket.on('error', (err) => {
      log.error('Client error:', err.message)
      clientSocket.destroy()
    })
  })

  server.on('error', (err) => {
    log.error('Proxy server error:', err.message)
  })

  return server
}

/**
 * Start forward proxy server
 * @param {Object} config - Configuration object
 * @returns {net.Server} Running TCP server instance
 */
const startForwardProxy = (config) => {
  const server = createForwardProxy(config)

  server.listen(config.proxyPort, () => {
    log.info(`Forward proxy listening on port ${config.proxyPort}`)
    log.info('Waiting for connections...')
  })

  return server
}

module.exports = startForwardProxy
