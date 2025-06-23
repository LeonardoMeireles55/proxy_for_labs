/**
 * @fileoverview Connection Simulator for Testing Laboratory Equipment Communication
 * This module provides a simple connection simulator that connects to a server
 * and sends test ASTM messages to verify proxy functionality and equipment communication.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('net')
const log = require('../utils/logger')
const { parseAstmMessage, createSampleMessages } = require('../protocols/astm')

/**
 * Configuration object for connection simulator
 * @typedef {Object} ConnectionConfig
 * @property {string} lisHost - Hostname of the LIS server to connect to
 * @property {number} lisPort - Port number of the LIS server
 * @property {boolean} [secure] - Whether to use secure connection (currently unused)
 */

/**
 * Sends an ASTM header message to the connected client
 *
 * @function sendHeaderMessage
 * @param {import('net').Socket} client - The connected socket client
 * @param {Object} samples - Sample messages object containing header data
 */
const sendHeaderMessage = (client, samples) => {
  log.info('Sending sample ASTM header...')
  client.write(samples.header)
}

/**
 * Sends initial ENQ (enquiry) message and schedules header message transmission
 * Demonstrates typical ASTM communication flow starting with handshake
 *
 * @function sendSampleMessages
 * @param {import('net').Socket} client - The connected socket client
 */
const sendSampleMessages = (client) => {
  const samples = createSampleMessages()
  log.info('Sending sample ASTM ENQ message...')
  client.write(samples.ENQ)

  // Send header after a short delay
  setTimeout(() => sendHeaderMessage(client, samples), 500)
}

/**
 * Handles data received from the server and attempts ASTM message parsing
 * Logs both raw data and parsed ASTM message information
 *
 * @function handleServerData
 * @param {Buffer} data - Raw data buffer received from server
 */
const handleServerData = (data) => {
  log.info('Received response from server')
  log.debug('Raw data:', data.toString())

  try {
    const parsed = parseAstmMessage(data)
    if (parsed) {
      log.info('Parsed ASTM message:', parsed.type, parsed.message || 'Data message')
    }
  } catch (error) {
    log.debug('Could not parse as ASTM:', error.message)
  }
}

/**
 * Starts a connection simulator that connects to a server and sends test messages
 * Useful for testing proxy functionality and verifying ASTM message handling
 *
 * @async
 * @function startConnectionSimulator
 * @param {ConnectionConfig} config - Configuration object for connection settings
 * @returns {Promise<import('net').Socket>} Promise that resolves to the connected socket
 * @throws {Error} If connection fails or encounters network errors
 */
const startConnectionSimulator = (config) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket()

    client.connect(config.lisPort, config.lisHost, () => {
      log.info(`Connected to server at ${config.lisHost}:${config.lisPort}`)

      // Send a sample message after connecting
      setTimeout(() => sendSampleMessages(client), 1000)
    })

    client.on('data', handleServerData)

    client.on('error', (error) => {
      log.error('Connection error:', error.message)
      reject(error)
    })

    client.on('close', () => {
      log.info('Connection closed')
    })

    resolve(client)
  })
}

module.exports = startConnectionSimulator
