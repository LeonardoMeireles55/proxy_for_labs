const net = require('node:net')
const readline = require('node:readline')
const log = require('../utils/logger')
const { parseAstmMessage, createSampleMessages } = require('../protocols/astm')

// Simple LIS Simulator with interactive menu
const createLisSimulator = (config) => {
  const sampleMessages = createSampleMessages()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const showMenu = () => {
    log.info('\n📋 LIS Simulator Menu:')
    log.info('═'.repeat(50))
    log.info('1. Send ENQ (Start Communication)')
    log.info('2. Send ACK (Acknowledge)')
    log.info('3. Send NAK (Negative Acknowledge)')
    log.info('4. Send EOT (End Transmission)')
    log.info('5. Send Sample Header')
    log.info('6. Send Sample Patient Record')
    log.info('7. Send Sample Order')
    log.info('8. Send Sample Result')
    log.info('9. Custom message')
    log.info('0. Show menu')
    log.info('q. Quit')
    log.info('═'.repeat(50))
  }

  const connectToProxy = () => {
    log.info(`Connecting to proxy at ${config.equipmentHost}:${config.proxyPort}`)

    const socket = net.createConnection({
      host: config.proxyHost,
      port: config.proxyPort
    }, () => {
      log.info('Connected to proxy!')
      showMenu()
      promptForInput()
    })

    socket.on('data', (data) => {
      log.info('\n📨 Received from equipment:')
      const parsed = parseAstmMessage(data)
      log.info(JSON.stringify(parsed, null, 2))
      log.info('\nSelect an option:')
    })

    socket.on('error', (err) => {
      log.error('Connection error:', err.message)
      process.exit(1)
    })

    socket.on('end', () => {
      log.info('Disconnected from proxy')
      process.exit(0)
    })

    const promptForInput = () => {
      rl.question('LIS > ', (input) => {
        const choice = input.trim().toLowerCase()

        if (choice === 'q' || choice === 'quit') {
          socket.end()
          return
        }

        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        if (choice === '9') {
          rl.question('Enter custom message: ', (message) => {
            if (message.trim()) {
              log.info(`Sending: ${message}`)
              socket.write(message)
            }
            promptForInput()
          })
          return
        }

        // Handle numbered options
        const messageMap = {
          '1': sampleMessages.ENQ,
          '2': sampleMessages.ACK,
          '3': sampleMessages.NAK,
          '4': sampleMessages.EOT,
          '5': Buffer.from(sampleMessages.header, 'latin1'),
          '6': Buffer.from(sampleMessages.patient, 'latin1'),
          '7': Buffer.from(sampleMessages.order, 'latin1'),
          '8': Buffer.from(sampleMessages.result, 'latin1')
        }

        if (messageMap[choice]) {
          const message = messageMap[choice]
          const displayMessage = message.toString('latin1').replace(/[\x00-\x1F]/g, (char) => `<${char.charCodeAt(0).toString(16).toUpperCase()}>`)
          log.info(`Sending: ${displayMessage}`)
          socket.write(message)
        } else if (input.trim()) {
          // Treat any other input as custom message
          socket.write(input + '\n')
        }

        promptForInput()
      })
    }
  }

  return { connectToProxy }
}

module.exports = createLisSimulator
