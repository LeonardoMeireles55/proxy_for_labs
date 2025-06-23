// Import centralized logger
const log = require('../utils/logger');

// Simple server shutdown utility
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

// ASTM constants
const ASTM = {
  ENQ: 0x05,  // Enquiry
  ACK: 0x06,  // Acknowledge
  NAK: 0x15,  // Negative Acknowledge
  STX: 0x02,  // Start of Text
  ETX: 0x03,  // End of Text
  EOT: 0x04,  // End of Transmission
  CR: 0x0D    // Carriage Return
}

module.exports = {
  gracefulShutdown,
  ASTM
}
