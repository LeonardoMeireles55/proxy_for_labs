const net = require('node:net')
const log = require('../utils/logger')
const { ASTM } = require('../proxy/utils')

// Simple Equipment Simulator
const createEquipmentSimulator = () => {
  return net.createServer((socket) => {
    log.info(`New client connected: ${socket.remoteAddress}`)

    // Send initial ENQ to start communication
    setTimeout(() => {
      log.debug('Sending ENQ to start communication')
      socket.write(Buffer.from([ASTM.ENQ]))
    }, 1000)

    socket.on('data', (data) => {
      log.debug(`Received data: ${data.toString('latin1')}`)

      if (data[0] === ASTM.ENQ) {
        log.debug('Received ENQ, sending ACK')
        socket.write(Buffer.from([ASTM.ACK]))
      } else if (data[0] === ASTM.ACK) {
        log.debug('Received ACK, ready for data transmission')
      } else {
        // Echo back any other data
        log.debug('Echoing data back')
        socket.write(Buffer.from([ASTM.ACK]))
      }
    })

    socket.on('error', (err) => {
      log.error('Socket error:', err.message)
    })

    socket.on('close', () => {
      log.info('Client disconnected')
    })
  })
}

module.exports = createEquipmentSimulator
