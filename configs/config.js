/**
 * @fileoverview Configuration module for the TCP Proxy for Laboratory Equipment Communication
 * This module loads environment variables and provides validated configuration settings
 * for both forward and reverse proxy modes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

require('dotenv').config();
/**
 * Main configuration object containing all server settings
 * @typedef {Object} ProxyConfig
 * @property {string} nodeEnv - Node.js environment (development, production, etc.)
 * @property {number} proxyPort - Port number for the proxy server
 * @property {number} equipmentPort - Port number for equipment connections
 * @property {number} lisPort - Port number for LIS (Laboratory Information System) connections
 * @property {string} equipmentHost - Hostname for equipment server
 * @property {string} lisHost - Hostname for LIS server
 * @property {string} proxyHost - Hostname for proxy server
 * @property {boolean} isReverseProxy - Whether to run in reverse proxy mode
 * @property {boolean} isForwardProxy - Whether to run in forward proxy mode
 * @property {string} logLevel - Logging level (debug, info, warn, error)
 * @property {boolean} logToFile - Whether to enable file logging
 * @property {number} connectionTimeout - Connection timeout in milliseconds
 * @property {number} shutdownTimeout - Graceful shutdown timeout in milliseconds
 * @property {number} reconnectDelay - Delay in milliseconds before reconnection attempts
 * @property {boolean} equipmentServerEmu - Whether to enable equipment server emulation
 * @property {boolean} equipmentClientEmu - Whether to enable equipment client emulation
 * @property {boolean} lisServerEmu - Whether to enable LIS server emulation
 * @property {boolean} lisClientEmu - Whether to enable LIS client emulation
 * @property {string} [baseUrl] - Base URL for API requests (optional)
 * @property {string} [qcForSector] - Quality control sector (optional)
 */

/**
 * Simple configuration with sensible defaults
 * @type {ProxyConfig}
 */
const config = {
  // Emulation environment
  equipmentServerEmu: process.env.EQUIPMENT_SERVER_EMU === 'true',
  equipmentClientEmu: process.env.EQUIPMENT_CLIENT_EMU === 'true',
  lisServerEmu: process.env.LIS_SERVER_EMU === 'true',
  lisClientEmu: process.env.LIS_CLIENT_EMU === 'true',

  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  qcForSector: process.env.QC_FOR_SECTOR || 'hematology',

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
  logToFile: process.env.LOG_TO_FILE === 'true' || true,

  // Timeouts
  connectionTimeout: 30000,
  shutdownTimeout: 10000,
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000')
};

// Validate configuration
if (!config.isReverseProxy && !config.isForwardProxy) {
  throw new Error(
    'Must set either IS_REVERSE_PROXY=true or IS_FORWARD_PROXY=true'
  );
}

if (config.isReverseProxy && config.isForwardProxy) {
  throw new Error('Cannot enable both reverse and forward proxy modes');
}

module.exports = config;
