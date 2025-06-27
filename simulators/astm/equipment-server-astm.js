/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using ASTM protocol.
 * It handles basic ASTM handshaking and can be used for testing proxy functionality.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../../helpers/logging/logger')
const { ASTM } = require('../../proxy/utils')

/**
 * Creates a laboratory equipment simulator server
 * The simulator accepts client connections and performs ASTM protocol handshaking,
 * including sending ENQ to initiate communication and responding to acknowledgments.
 *
 * @function createEquipmentServerASTM
 * @returns {import('net').Server} TCP server instance that simulates laboratory equipment
 */
const createEquipmentServerASTM = () => {
  return net.createServer((socket) => {
    log.info(`New client connected: ${socket.remoteAddress}`)

    // Send initial ENQ to start communication
    setTimeout(() => {
      log.info('Sending ENQ to start communication')
      socket.write(Buffer.from([ASTM.ENQ]))
    }, 1000)

    socket.on('data', (data) => {
      log.info(`Received data: ${data.toString('latin1')}`)

      if (data[0] === ASTM.ENQ) {

        log.info('Received ENQ, sending ACK')

        socket.write(Buffer.from([ASTM.ACK]))
      }

      if (data[0] === ASTM.ACK) {
        log.info('Received ACK, ready for data transmission')
      }

      else {
        log.info('Echoing data back')
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

module.exports = createEquipmentServerASTM
