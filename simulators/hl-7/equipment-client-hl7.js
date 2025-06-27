const net = require('node:net')
const config = require('../../config')
const log = require('../../helpers/logging/logger')
const { HL7Example4 } = require('./messages')

/**
 * Creates connection to proxy server
 */
const createConnection = () => {
  const client = net.connect({
    host: config.proxyHost,
    port: config.proxyPort
  }, () => {
    log.info(`Equipment client HL7 -> connected to proxy at ${config.proxyHost}:${config.proxyPort}`)

    log.info('Equipment client HL7 -> sent HL7 Example to proxy')
    client.write(HL7Example4)
  })

  client.on('data', (data) => {
    log.info('Equipment client HL7 -> received data from proxy')
    log.info(`Equipment client HL7 -> data length: ${data.length} bytes`)
  })

  client.on('error', (err) => {
    log.error('Equipment client HL7 -> error:', err)
    scheduleReconnect()
  })

  client.on('close', () => {
    log.info('Equipment client HL7 -> disconnected')
    scheduleReconnect()
  })

  return client
}

/**
 * Schedules reconnection after 5 seconds
 */
const scheduleReconnect = () => {
  setTimeout(() => {
    log.info('Equipment client HL7 -> reconnecting...')
    createEquipmentClientHL7()
  }, 5000)
}

/**
 * Creates and starts the HL7 equipment client
 */
const createEquipmentClientHL7 = () => {
  return createConnection()
}

module.exports = createEquipmentClientHL7
