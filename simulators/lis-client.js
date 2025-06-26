/**
 * @fileoverview Laboratory Information System (LIS) Simulator
 * This module provides an interactive LIS simulator with a command-line interface
 * for testing laboratory equipment communication through the proxy server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../utils/logger')
const { parseAstmMessage } = require('../protocols/astm-lib')
const { parseMessage } = require('../protocols/hl7-lib')

/**
 * Configuration object for LIS simulator
 * @typedef {Object} LISConfig
 * @property {string} proxyHost - Hostname of the proxy server to connect to
 * @property {number} proxyPort - Port number of the proxy server
 * @property {boolean} [secure] - Whether to use secure connection (currently unused)
 */

/**
 * LIS simulator object with connection functionality
 * @typedef {Object} LISSimulator
 * @property {Function} connectToProxy - Function to establish connection to proxy server
 */

/**
 * Creates an interactive LIS simulator with command-line interface
 * Provides menu-driven interaction for sending various ASTM messages to laboratory equipment
 * through the proxy server, including control messages and sample data records.
 *
 * @function createLisSimulator
 * @param {LISConfig} config - Configuration object for proxy connection
 */
const createLisClientSimulator = (config) => {
  /**
   * Connects to the proxy server and starts the interactive CLI
   * @returns {void}
   */
    const client = net.createConnection({ host: config.proxyHost, port: config.proxyPort }, () => {
      log.info(`Connected to proxy server at ${config.proxyHost}:${config.proxyPort}`)
    })

    client.on('data', (data) => {
      const message = parseAstmMessage(data) || parseMessage(data.toString('utf8'))

      log.info(`Received message ASTM: ${message.message}`) ||
      log.info(`Received message HL7: ${message}`)

    })

    client.on('error', (err) => {
      log.error(`Connection error: ${err.message}`)
    })

    client.on('close', () => {
      log.info('Connection closed')
    })

    return client
  }


module.exports = createLisClientSimulator
