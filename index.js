const config = require('./config')
const log = require('./utils/logger')
const { gracefulShutdown } = require('./proxy/utils')
const startForwardProxy = require('./proxy/forward')
const startReverseProxy = require('./proxy/reverse')

// Store active servers for graceful shutdown
let activeServers = []

// Main application startup
const main = async () => {
  try {
    log.info('Starting proxy server...')

    if (config.isForwardProxy) {
      log.info('Starting in forward proxy mode')
      const server = await startForwardProxy(config)
      activeServers.push(server)
    } else if (config.isReverseProxy) {
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

// Graceful shutdown handler
const shutdown = async (signal) => {
  log.info(`Received ${signal}. Shutting down gracefully...`)

  try {
    await gracefulShutdown(activeServers, config.shutdownTimeout)
    log.info('Graceful shutdown completed')
    process.exit(0)
  } catch (error) {
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



