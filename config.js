require('dotenv').config()

// Simple configuration with sensible defaults
const config = {
  // Server ports
  proxyPort: parseInt(process.env.PORT || '7005'),
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
