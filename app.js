/**
 * @fileoverview Main entry point for the TCP Proxy for Laboratory Equipment Communication
 * This module initializes and manages the proxy server, supporting both forward and reverse proxy modes
 * for ASTM/HL7 laboratory equipment communication.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const log = require('./configs/logger');
const config = require('./configs/config');
const { startForwardProxy } = require('./src/proxies/forward-proxy');
const { startReverseProxy } = require('./src/proxies/reverse-proxy');

/**
 * Array to store active server instances for graceful shutdown management
 * @type {Array<import('net').Server>}
 */
let activeServers = [];
let isShuttingDown = false;

/**
 * Starts forward proxy if configured
 */
const initializeForwardProxy = () => {
  log.debug('Starting in forward proxy mode');
  const server = startForwardProxy(config);
  activeServers.push(server);
};

/**
 * Starts reverse proxy if configured
 */
const initializeReverseProxy = async () => {
  log.debug('Starting in reverse proxy mode');
  const server = await startReverseProxy(config);
  activeServers.push(server);
};

/**
 * Closes a single server
 */
const closeServer = (server) => {
  return /** @type {Promise<void>} */ (
    /** @type {Promise<void>}
     */ (
      new Promise((resolve) => {
        if (server?.close) {
          server.close(() => {
            log.debug('Server closed');
            resolve(process.exit(1));
          });
        } else {
          resolve();
        }
      })
    )
  );
};

/**
 * Closes all active servers
 */
const closeAllServers = () => {
  return Promise.all(activeServers.map(closeServer));
};

/**
 * Main application startup function
 */
const main = async () => {
  try {
    log.debug('Starting proxy server...');

    if (config.isForwardProxy) {
      initializeForwardProxy();
    }

    if (config.isReverseProxy) {
      await initializeReverseProxy();
    }

    log.debug(`Proxy server started successfully on port ${config.proxyPort}`);
  } catch (error) {
    log.error('Failed to start proxy server:', error.message);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler - prevents duplicate shutdowns
 */
const shutdown = async (signal) => {
  if (isShuttingDown) {
    log.debug('Shutdown already in progress, ignoring signal');
    return;
  }

  isShuttingDown = true;
  log.debug(`Received ${signal}. Shutting down gracefully...`);

  try {
    await closeAllServers();
    activeServers = [];
    log.debug('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

/**
 * Sets up process signal handlers - prevents duplicate listeners
 */
const setupProcessHandlers = () => {
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
    process.exit(1);
  });
  process.once('unhandledRejection', (reason) => {
    log.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
};

// Initialize process handlers and start application
setupProcessHandlers();
main();
