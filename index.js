/**
 * @fileoverview Main entry point for the TCP Proxy for Laboratory Equipment Communication
 * This module initializes and manages the proxy server, supporting both forward and reverse proxy modes
 * for ASTM/HL7 laboratory equipment communication.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const config = require('./config')
const log = require('./utils/logger')
const { gracefulShutdown } = require('./proxy/utils')
const startForwardProxy = require('./proxy/forward')
const startReverseProxy = require('./proxy/reverse')

/**
 * Array to store active server instances for graceful shutdown management
 * @type {Array<import('net').Server>}
 */
let activeServers = []

/**
 * Main application startup function
 * Initializes the proxy server based on configuration (forward or reverse mode)
 *
 * @async
 * @function main
 * @returns {Promise<void>} Promise that resolves when the server starts successfully
 * @throws {Error} If server fails to start or configuration is invalid
 */
const main = async () => {
  try {
    log.info('Starting proxy server...')

    if (config.isForwardProxy) {

      log.info('Starting in forward proxy mode')

      const server = await startForwardProxy(config)

      activeServers.push(server)
    }

    if (config.isReverseProxy) {

      log.info('Starting in reverse proxy mode')

      const server = await startReverseProxy(config)

      activeServers.push(server)
    }

    log.info(`Proxy server started successfully on port ${config.proxyPort}`)

  } catch (error) {

    log.error('Failed to start proxy server:', error.message)

    process.exit(1)
  }
}

/**
 * Graceful shutdown handler for process termination signals
 * Closes all active servers and performs cleanup before process exit
 *
 * @async
 * @function shutdown
 * @param {string} signal - The termination signal received (SIGTERM, SIGINT, etc.)
 * @returns {Promise<void>} Promise that resolves when shutdown is complete
 */
const shutdown = async (signal) => {
  log.info(`Received ${signal}. Shutting down gracefully...`)

  try {

    await gracefulShutdown(activeServers, config.shutdownTimeout)

    log.info('Graceful shutdown completed')

    process.exit(0)
  }

  catch (error) {

    log.error('Error during shutdown:', error.message)

    process.exit(1)
  }
}

// Setup process handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception:', err)
  process.exit(1)
})
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the application
main()



