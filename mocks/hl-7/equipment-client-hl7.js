const net = require('node:net')
const config = require('../../config')
const log = require('../../shared/logger')
const { HL7_MOCK_BUFFER, sendHL7Acknowledgment, createAcknowledgment } = require('../../handlers/hl7/helpers/hl7-acknowledgment')

/**
 * Creates connection to proxy server
 */
const createConnection = () => {
  const client = net.connect({
    host: config.proxyHost,
    port: config.proxyPort
  }, () => {
    log.debug(`Equipment client HL7 -> connected to proxy at ${config.proxyHost}:${config.proxyPort}`)

    // log.debug('Equipment client HL7 -> sent HL7 Example to proxy')

    // client.write(HL7_MOCK_BUFFER)

    log.debug('Equipment client HL7 -> sent HL7 acknowledgment to proxy')
    const ack = createAcknowledgment()

    sendHL7Acknowledgment(ack, client)
  })

  client.on('data', (data) => {
    log.debug('Equipment client HL7 -> received data from proxy')
    log.debug(`Equipment client HL7 -> data length: ${data.length} bytes`)

    setTimeout(() => {
      log.debug('Equipment client HL7 -> sending HL7 Example to proxy')
      client.write(data)
    }, 5000);
  })

  client.on('error', (err) => {
    log.error('Equipment client HL7 -> error:', err)
    client.destroy() // Close the connection on error
    scheduleReconnect()
  })

  client.on('close', () => {
    log.debug('Equipment client HL7 -> disconnected')
    client.off // Ensure the connection is closed
    scheduleReconnect()
  })

  return client
}

/**
 * Schedules reconnection after 5 seconds
 */
const scheduleReconnect = (client) => {
  setTimeout(() => {
    log.debug('Equipment client HL7 -> reconnecting...')
    createEquipmentClientHL7()
  }, 10000)
}

/**
 * Creates and starts the HL7 equipment client
 */
const createEquipmentClientHL7 = () => {
  return createConnection()
}

module.exports = createEquipmentClientHL7
