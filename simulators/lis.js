/**
 * @fileoverview Laboratory Information System (LIS) Simulator
 * This module provides an interactive LIS simulator with a command-line interface
 * for testing laboratory equipment communication through the proxy server.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const readline = require('node:readline')
const log = require('../utils/logger')
const { parseAstmMessage, createSampleMessages, mockMessages } = require('../protocols/astm')

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
 * @returns {LISSimulator} LIS simulator instance with connection capabilities
 */
const createLisSimulator = (config) => {
  const sampleMessages = createSampleMessages()
  const mocks = mockMessages()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  /**
   * Displays the main interactive menu with available ASTM message options
   * @function showMenu
   */
  const showMenu = () => {
    log.info('\n📋 LIS Simulator Menu:')
    log.info('═'.repeat(60))
    log.info('📤 BASIC MESSAGES:')
    log.info('1. Send ENQ (Start Communication)')
    log.info('2. Send ACK (Acknowledge)')
    log.info('3. Send NAK (Negative Acknowledge)')
    log.info('4. Send EOT (End Transmission)')
    log.info('5. Send Sample Header')
    log.info('6. Send Sample Patient Record')
    log.info('7. Send Sample Order')
    log.info('8. Send Sample Result')
    log.info('')
    log.info('🔬 MOCK MESSAGES:')
    log.info('10. Control Messages (ENQ, ACK, NAK, etc.)')
    log.info('11. Basic Records (Header, Patient, Order, Result)')
    log.info('12. Chemistry Panel Results')
    log.info('13. Hematology Panel Results')
    log.info('14. Abnormal Results (High/Low values)')
    log.info('15. Error Scenarios')
    log.info('16. Complete Message Sequences')
    log.info('17. Generate Random Patient')
    log.info('18. Generate Custom Result')
    log.info('')
    log.info('🛠️  UTILITIES:')
    log.info('9. Custom message')
    log.info('0. Show menu')
    log.info('q. Quit')
    log.info('═'.repeat(60))
  }

  /**
   * Displays control messages submenu
   * @function showControlMenu
   */
  const showControlMenu = () => {
    log.info('\n🎛️  Control Messages:')
    log.info('─'.repeat(40))
    log.info('1. ENQ (Enquiry)')
    log.info('2. ACK (Acknowledge)')
    log.info('3. NAK (Negative Acknowledge)')
    log.info('4. EOT (End of Transmission)')
    log.info('5. STX (Start of Text)')
    log.info('6. ETX (End of Text)')
    log.info('0. Back to main menu')
    log.info('─'.repeat(40))
  }

  /**
   * Displays basic records submenu
   * @function showRecordsMenu
   */
  const showRecordsMenu = () => {
    log.info('\n📄 Basic Records:')
    log.info('─'.repeat(40))
    log.info('1. Header Record')
    log.info('2. Patient Record')
    log.info('3. Order Record')
    log.info('4. Result Record')
    log.info('5. Comment Record')
    log.info('6. Terminator Record')
    log.info('0. Back to main menu')
    log.info('─'.repeat(40))
  }

  /**
   * Displays abnormal results submenu
   * @function showAbnormalMenu
   */
  const showAbnormalMenu = () => {
    log.info('\n⚠️  Abnormal Results:')
    log.info('─'.repeat(40))
    log.info('1. High Glucose (250.0 mg/dL)')
    log.info('2. Low Sodium (125 mmol/L)')
    log.info('3. Critical Potassium (6.8 mmol/L)')
    log.info('0. Back to main menu')
    log.info('─'.repeat(40))
  }

  /**
   * Displays error scenarios submenu
   * @function showErrorMenu
   */
  const showErrorMenu = () => {
    log.info('\n❌ Error Scenarios:')
    log.info('─'.repeat(40))
    log.info('1. Sample Error (Hemolyzed)')
    log.info('2. Instrument Error')
    log.info('3. QC Failure')
    log.info('0. Back to main menu')
    log.info('─'.repeat(40))
  }

  /**
   * Displays sequences submenu
   * @function showSequencesMenu
   */
  const showSequencesMenu = () => {
    log.info('\n🔄 Message Sequences:')
    log.info('─'.repeat(40))
    log.info('1. Normal Workflow (ENQ → Data → EOT)')
    log.info('2. Error Workflow (ENQ → Error → EOT)')
    log.info('0. Back to main menu')
    log.info('─'.repeat(40))
  }

  /**
   * Sends a message through the socket with proper formatting
   * @function sendMessage
   * @param {import('net').Socket} socket - The network socket
   * @param {Buffer|string} message - The message to send
   */
  const sendMessage = (socket, message) => {
    const buffer = Buffer.isBuffer(message) ? message : Buffer.from(message, 'latin1')
    const displayMessage = buffer.toString('latin1').replace(/[\x00-\x1F]/g, (char) => `<${char.charCodeAt(0).toString(16).toUpperCase()}>`)
    log.info(`📤 Sending: ${displayMessage}`)
    socket.write(buffer)
  }

  /**
   * Sends a sequence of messages with delays
   * @function sendSequence
   * @param {import('net').Socket} socket - The network socket
   * @param {Array} sequence - Array of messages to send
   */
  const sendSequence = (socket, sequence) => {
    log.info(`📤 Sending sequence of ${sequence.length} messages...`)
    sequence.forEach((message, index) => {
      setTimeout(() => {
        sendMessage(socket, message)
        if (index === sequence.length - 1) {
          log.info('✅ Sequence completed!')
        }
      }, index * 1000) // 1 second delay between messages
    })
  }

  /**
   * Establishes connection to the proxy server and starts interactive session
   * Handles incoming ASTM messages from equipment and provides command-line interface
   * for sending various types of messages.
   *
   * @function connectToProxy
   */
  const connectToProxy = () => {
    log.info(`Connecting to proxy at ${config.proxyHost}:${config.proxyPort}`)

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
    })    /**
     * Prompts user for input and processes menu selections
     * Handles various ASTM message types and custom message input
     * @function promptForInput
     */
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

        // Handle basic messages (1-8)
        if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(choice)) {
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
          sendMessage(socket, messageMap[choice])
          promptForInput()
          return
        }

        // Handle custom message (9)
        if (choice === '9') {
          rl.question('Enter custom message: ', (message) => {
            if (message.trim()) {
              sendMessage(socket, message)
            }
            promptForInput()
          })
          return
        }

        // Handle mock message submenus (10-18)
        switch (choice) {
          case '10': // Control Messages
            showControlMenu()
            handleControlMenu(socket)
            break
          case '11': // Basic Records
            showRecordsMenu()
            handleRecordsMenu(socket)
            break
          case '12': // Chemistry Panel
            log.info('📤 Sending Chemistry Panel...')
            mocks.multiTest.chemistry.forEach((msg, index) => {
              setTimeout(() => sendMessage(socket, msg), index * 500)
            })
            promptForInput()
            break
          case '13': // Hematology Panel
            log.info('📤 Sending Hematology Panel...')
            mocks.multiTest.hematology.forEach((msg, index) => {
              setTimeout(() => sendMessage(socket, msg), index * 500)
            })
            promptForInput()
            break
          case '14': // Abnormal Results
            showAbnormalMenu()
            handleAbnormalMenu(socket)
            break
          case '15': // Error Scenarios
            showErrorMenu()
            handleErrorMenu(socket)
            break
          case '16': // Complete Sequences
            showSequencesMenu()
            handleSequencesMenu(socket)
            break
          case '17': // Random Patient
            rl.question('Enter patient ID (default: 1): ', (patientId) => {
              const id = parseInt(patientId) || 1
              const randomPatient = mocks.generators.randomPatient(id)
              sendMessage(socket, randomPatient)
              promptForInput()
            })
            break
          case '18': // Custom Result
            rl.question('Enter: seqNum,testCode,value,units,refRange (e.g., 1,GLU,150,mg/dL,70.0^110.0): ', (resultData) => {
              const parts = resultData.split(',')
              if (parts.length === 5) {
                const customResult = mocks.generators.customResult(
                  parseInt(parts[0]),
                  parts[1],
                  parseFloat(parts[2]),
                  parts[3],
                  parts[4]
                )
                sendMessage(socket, customResult)
              } else {
                log.info('❌ Invalid format. Expected: seqNum,testCode,value,units,refRange')
              }
              promptForInput()
            })
            break
          default:
            if (input.trim()) {
              // Treat any other input as custom message
              sendMessage(socket, input + '\n')
            }
            promptForInput()
        }
      })
    }

    /**
     * Handles control messages submenu
     * @function handleControlMenu
     * @param {import('net').Socket} socket - The network socket
     */
    const handleControlMenu = (socket) => {
      rl.question('Control > ', (input) => {
        const choice = input.trim()
        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        const controlMap = {
          '1': mocks.control.enq,
          '2': mocks.control.ack,
          '3': mocks.control.nak,
          '4': mocks.control.eot,
          '5': mocks.control.stx,
          '6': mocks.control.etx
        }

        if (controlMap[choice]) {
          sendMessage(socket, controlMap[choice])
        }
        promptForInput()
      })
    }

    /**
     * Handles basic records submenu
     * @function handleRecordsMenu
     * @param {import('net').Socket} socket - The network socket
     */
    const handleRecordsMenu = (socket) => {
      rl.question('Records > ', (input) => {
        const choice = input.trim()
        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        const recordMap = {
          '1': mocks.records.header,
          '2': mocks.records.patient,
          '3': mocks.records.order,
          '4': mocks.records.result,
          '5': mocks.records.comment,
          '6': mocks.records.terminator
        }

        if (recordMap[choice]) {
          sendMessage(socket, recordMap[choice])
        }
        promptForInput()
      })
    }

    /**
     * Handles abnormal results submenu
     * @function handleAbnormalMenu
     * @param {import('net').Socket} socket - The network socket
     */
    const handleAbnormalMenu = (socket) => {
      rl.question('Abnormal > ', (input) => {
        const choice = input.trim()
        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        const abnormalMap = {
          '1': mocks.abnormal.highGlucose,
          '2': mocks.abnormal.lowSodium,
          '3': mocks.abnormal.criticalPotassium
        }

        if (abnormalMap[choice]) {
          sendMessage(socket, abnormalMap[choice])
        }
        promptForInput()
      })
    }

    /**
     * Handles error scenarios submenu
     * @function handleErrorMenu
     * @param {import('net').Socket} socket - The network socket
     */
    const handleErrorMenu = (socket) => {
      rl.question('Errors > ', (input) => {
        const choice = input.trim()
        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        const errorMap = {
          '1': mocks.errors.sampleError,
          '2': mocks.errors.instrumentError,
          '3': mocks.errors.qcFailure
        }

        if (errorMap[choice]) {
          sendMessage(socket, errorMap[choice])
        }
        promptForInput()
      })
    }

    /**
     * Handles sequences submenu
     * @function handleSequencesMenu
     * @param {import('net').Socket} socket - The network socket
     */
    const handleSequencesMenu = (socket) => {
      rl.question('Sequences > ', (input) => {
        const choice = input.trim()
        if (choice === '0') {
          showMenu()
          promptForInput()
          return
        }

        if (choice === '1') {
          sendSequence(socket, mocks.sequences.normalWorkflow)
        } else if (choice === '2') {
          sendSequence(socket, mocks.sequences.errorWorkflow)
        }

        promptForInput()
      })
    }
  }

  return { connectToProxy }
}

module.exports = createLisSimulator
