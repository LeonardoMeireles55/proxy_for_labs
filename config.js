/**
 * @fileoverview Configuration module for the TCP Proxy for Laboratory Equipment Communication
 * This module loads environment variables and provides validated configuration settings
 * for both forward and reverse proxy modes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

require('dotenv').config()

/**
 * Main configuration object containing all server settings
 * @typedef {Object} ProxyConfig
 * @property {number} proxyPort - Port number for the proxy server
 * @property {number} equipmentPort - Port number for equipment connections
 * @property {number} lisPort - Port number for LIS (Laboratory Information System) connections
 * @property {string} equipmentHost - Hostname for equipment server
 * @property {string} lisHost - Hostname for LIS server
 * @property {string} proxyHost - Hostname for proxy server
 * @property {boolean} isReverseProxy - Whether to run in reverse proxy mode
 * @property {boolean} isForwardProxy - Whether to run in forward proxy mode
 * @property {string} logLevel - Logging level (debug, info, warn, error)
 * @property {number} connectionTimeout - Connection timeout in milliseconds
 * @property {number} shutdownTimeout - Graceful shutdown timeout in milliseconds
 */

/**
 * Simple configuration with sensible defaults
 * @type {ProxyConfig}
 */
const config = {
  // Server ports
  proxyPort: parseInt(process.env.PROXY_PORT || '5400'),
  equipmentPort: parseInt(process.env.EQUIPMENT_PORT || '7006'),
  lisPort: parseInt(process.env.LIS_PORT || '8080'),

  // Hosts
  equipmentHost: process.env.EQUIPMENT_HOST || 'localhost',
  lisHost: process.env.LIS_HOST || 'localhost',
  proxyHost: process.env.PROXY_HOST || 'localhost',

  // Proxy mode (only one should be true)
  isReverseProxy: process.env.IS_REVERSE_PROXY === 'true',
  isForwardProxy: process.env.IS_FORWARD_PROXY === 'true',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Timeouts
  connectionTimeout: 30000,
  shutdownTimeout: 10000
}

// Validate configuration
if (!config.isReverseProxy && !config.isForwardProxy) {
  throw new Error('Must set either IS_REVERSE_PROXY=true or IS_FORWARD_PROXY=true')
}

if (config.isReverseProxy && config.isForwardProxy) {
  throw new Error('Cannot enable both reverse and forward proxy modes')
}

module.exports = config
