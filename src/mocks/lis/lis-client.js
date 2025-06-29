/**
 * @fileoverview Laboratory Information System (LIS) Simulator
 * This module provides an interactive LIS simulator with a command-line interface
 * for testing laboratory equipment communication through the proxy server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const { parseMessage } = require('../../handlers/hl7')
const { parseAstmMessage } = require('../../handlers/astm')
const log = require('../../../configs/logger')



/**
 * Configuration object for LIS simulator
 * @typedef {Object} LISConfig
 * @property {string} proxyHost - Hostname of the proxy server to connect to
 * @property {number} proxyPort - Port number of the proxy server
 */

/**
 * LIS simulator object with connection functionality
 * @typedef {Object} LISSimulator
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

    const client = net.createConnection({ host: config.proxyHost, port: config.proxyPort }, () => {
      log.debug(`Lis Client -> connected to proxy server at ${config.proxyHost}:${config.proxyPort}`
      )
    })

    client.on('data', (data) => {

      const message = parseAstmMessage(data) || parseMessage(data)

      log.debug(`Lis Client -> received message ASTM: ${message}`) ||
      log.debug(`Lis Client -> received message HL7: ${message}`)

    })

    client.on('error', (err) => {
      log.error(`Lis Client -> ${err}`)
    })

    client.on('close', () => {
      log.debug('Lis Client -> connection closed')
    })

    return client
  }


module.exports = createLisClientSimulator
