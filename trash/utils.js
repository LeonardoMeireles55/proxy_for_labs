/**
 * @fileoverview Utility functions and constants for proxy server operations
 * This module provides graceful shutdown capabilities and ASTM protocol constants
 * used throughout the proxy system.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const log = require('../libs/shared/logger')

// Import centralized logger

/**
 * Gracefully shuts down an array of server instances with timeout handling
 *
 * @async
 * @function gracefulShutdown
 * @param {Array<import('net').Server>} servers - Array of server instances to close
 * @param {number} [timeout=5000] - Maximum time to wait for shutdown in milliseconds
 * @returns {Promise<void>} Promise that resolves when all servers are closed
 */
const gracefulShutdown = (servers, timeout = 5000) => {
  return new Promise((resolve) => {
    log.info('Starting graceful shutdown...')

    const shutdownPromises = servers.map(server => {
      return new Promise(serverResolve => {
        if (server && typeof server.close === 'function') {
          server.close(() => {
            log.info('Server closed')
            serverResolve(undefined)
          })

          // Force close after timeout
          setTimeout(() => {
            log.warn('Force closing server after timeout')
            serverResolve(undefined)
          }, timeout)
        } else {
          serverResolve(undefined)
        }
      })
    })

    Promise.all(shutdownPromises).then(() => {
      log.info('All servers closed')
      resolve(undefined)
    })
  })
}

/**
 * ASTM protocol control character constants
 * These constants define the standard ASTM communication protocol control characters
 * used for handshaking and message framing in laboratory equipment communication.
 *
 * @typedef {Object} ASTMConstants
 * @property {number} ENQ - Enquiry (0x05) - Request to start communication
 * @property {number} ACK - Acknowledge (0x06) - Positive response/acknowledgment
 * @property {number} NAK - Negative Acknowledge (0x15) - Error response
 * @property {number} STX - Start of Text (0x02) - Beginning of data message
 * @property {number} ETX - End of Text (0x03) - End of data message
 * @property {number} EOT - End of Transmission (0x04) - End of communication session
 * @property {number} CR - Carriage Return (0x0D) - Line terminator
 */

/**
 * ASTM constants for protocol communication
 * @type {ASTMConstants}
 */
const ASTM = {
  ENQ: 0x05,  // Enquiry
  ACK: 0x06,  // Acknowledge
  NAK: 0x15,  // Negative Acknowledge
  STX: 0x02,  // Start of Text
  ETX: 0x03,  // End of Text
  EOT: 0x04,  // End of Transmission
  CR: 0x0D    // Carriage Return
}

/**
 * HL7 protocol control character constants
 * @type {Object}
 */
const HL7 = {
  START_BLOCK: 0x0B,  // VT - Start of block
  END_BLOCK: 0x1C,    // FS - End of block
  CARRIAGE_RETURN: 0x0D // CR - Message terminator
}

module.exports = {
  gracefulShutdown
}
