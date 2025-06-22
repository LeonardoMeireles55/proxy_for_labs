const net = require('node:net')
const readline = require('node:readline')
const { convertAstmToJson } = require('../src/communications/parsers/astm')

const PROXY_HOST = 'localhost'
const PROXY_PORT = 7005

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const connectToProxy = () => {
  console.log(`Connecting to proxy at ${PROXY_HOST}:${PROXY_PORT}...`)

  const socket = net.createConnection({ host: PROXY_HOST, port: PROXY_PORT }, () => {
    console.log('✅ Connected to proxy!')
    console.log('Type messages to send to equipment (or "quit" to exit):')

    promptForMessage()
  })

  socket.on('data', (data) => {
    console.log(`📨 Received from equipment}`)
    console.log(convertAstmToJson(data.toString('latin1')))
    promptForMessage()
  })

  socket.on('error', (err) => {
    console.error('❌ Connection error:', err.message)
    process.exit(1)
  })

  socket.on('end', () => {
    console.log('🔌 Disconnected from proxy')
    process.exit(0)
  })

  const promptForMessage = () => {
    rl.question('LIS > ', (message) => {
      if (message.toLowerCase() === 'quit') {
        socket.end()
        return
      }

      if (message.trim()) {
        socket.write(message + '\n')
      } else {
        promptForMessage()
      }
    })
  }
}

connectToProxy()
