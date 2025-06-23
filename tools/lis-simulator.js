const net = require('node:net')
const readline = require('node:readline')
const log = require('../utils/logger')
const { astmToJson } = require('../utils/astm-to-json')
const { astmFraming } = require('../utils/buffers')

const PROXY_HOST = 'localhost'
const PROXY_PORT = 7005

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Predefined message templates
const messageTemplates = {
  '1': {
    name: 'ASTM Handshake (ENQ)',
    message: String.fromCharCode(astmFraming.HANDSHAKE_ENQ)
  },
  '2': {
    name: 'ASTM ACK',
    message: String.fromCharCode(astmFraming.HANDSHAKE_ACK)
  },
  '3': {
    name: 'ASTM NAK',
    message: String.fromCharCode(astmFraming.HANDSHAKE_NAK)
  },
  '4': {
    name: 'ASTM EOT (End of Transmission)',
    message: String.fromCharCode(astmFraming.END_TRANSMISSION)
  },
  '5': {
    name: 'Sample ASTM Header',
    message: `${String.fromCharCode(astmFraming.START_FRAME)}1H|\\^&|||LIS^Host^1.0.0||||||P|LIS02-A2|20231201120000${String.fromCharCode(astmFraming.END_FRAME)}`
  },
  '6': {
    name: 'Sample ASTM Patient Record',
    message: `${String.fromCharCode(astmFraming.START_FRAME)}2P|1||12345||DOE^JOHN||19800101|M|||||||||||||||||||${String.fromCharCode(astmFraming.END_FRAME)}`
  },
  '7': {
    name: 'Sample ASTM Order Record',
    message: `${String.fromCharCode(astmFraming.START_FRAME)}3O|1|12345||^^^GLU|||20231201120000||||||||||||||||||F${String.fromCharCode(astmFraming.END_FRAME)}`
  },
  '8': {
    name: 'Sample ASTM Result Record',
    message: `${String.fromCharCode(astmFraming.START_FRAME)}4R|1|^^^GLU|120|mg/dL||N||F||||20231201120000${String.fromCharCode(astmFraming.END_FRAME)}`
  }
}

const showMenu = () => {
  log.info('\n📋 LIS Simulator Menu:')
  log.info('═'.repeat(50))

  Object.entries(messageTemplates).forEach(([key, template]) => {
    log.info(`${key}. ${template.name}`)
  })

  log.info('9. Custom message (free text)')
  log.info('0. Show menu again')
  log.info('q. Quit')
  log.info('═'.repeat(50))
  log.info('Select an option:')
}

const sendMessage = (socket, message) => {
  log.info(`📤 Sending: ${message.replace(/[\x00-\x1F]/g, (char) => `<${char.charCodeAt(0).toString(16).toUpperCase()}>`)}`)
  socket.write(message)
}

const connectToProxy = () => {
  log.info(`Connecting to proxy at ${PROXY_HOST}:${PROXY_PORT}...`)

  const socket = net.createConnection({ host: PROXY_HOST, port: PROXY_PORT }, () => {
    log.info('✅ Connected to proxy!')
    log.info('Welcome to LIS Simulator!')
    showMenu()
    promptForMessage()
  })

  socket.on('data', (data) => {
    log.info(`📨 Received from equipment:`)
    log.info(astmToJson(data))
    log.info('\nSelect an option:')
  })

  socket.on('error', (err) => {
    log.error('❌ Connection error:', err.message)
    process.exit(1)
  })

  socket.on('end', () => {
    log.info('🔌 Disconnected from proxy')
    process.exit(0)
  })

  const promptForMessage = () => {
    rl.question('LIS > ', (input) => {
      const choice = input.trim().toLowerCase()

      if (choice === 'q' || choice === 'quit') {
        socket.end()
        return
      }

      if (choice === '0') {
        showMenu()
        promptForMessage()
        return
      }

      if (choice === '9') {
        rl.question('Enter custom message: ', (customMessage) => {
          if (customMessage.trim()) {
            sendMessage(socket, customMessage + '\n')
          }
          promptForMessage()
        })
        return
      }

      if (messageTemplates[choice]) {
        const template = messageTemplates[choice]
        log.info(`📋 Selected: ${template.name}`)
        sendMessage(socket, template.message)
        promptForMessage()
        return
      }

      if (input.trim()) {
        // If not a menu option, treat as custom message
        sendMessage(socket, input + '\n')
      }

      promptForMessage()
    })
  }
}

connectToProxy()
