const net = require('net')
const log = require('../utils/logger')
const { parseAstmMessage, createSampleMessages } = require('../protocols/astm')

// Simple connection simulator that connects to a server and sends test messages
const startConnectionSimulator = (config) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket()

    client.connect(config.lisPort, config.lisHost, () => {
      log.info(`Connected to server at ${config.lisHost}:${config.lisPort}`)

      // Send a sample message after connecting
      setTimeout(() => {
        const samples = createSampleMessages()
        log.info('Sending sample ASTM ENQ message...')
        client.write(samples.ENQ)

        // Send header after a short delay
        setTimeout(() => {
          log.info('Sending sample ASTM header...')
          client.write(samples.header)
        }, 500)
      }, 1000)
    })

    client.on('data', (data) => {
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
    })

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
