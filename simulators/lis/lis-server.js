/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using ASTM protocol.
 * It handles basic ASTM handshaking and can be used for testing proxy functionality.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../../libs/shared/logger')
const { ASCII_BUFFERS } = require('../../libs/shared/buffers')

/**
 * ASTM message handlers for LIS server
 */
const messageHandlers = {
  [ASCII_BUFFERS.ENQ]: (socket) => {
    log.info('Lis Server -> received ENQ, sending ACK')
    socket.write(Buffer.from([ASCII_BUFFERS.ACK]))
  },

  [ASCII_BUFFERS.ACK]: () => {
    log.info('Lis Server -> received ACK, ready for data transmission')
  },

  [ASCII_BUFFERS.EOT]: (socket) => {
    log.info('Lis Server -> received EOT, closing connection')
    socket.end()
  },

  ['raw']: (socket, data) => {
    log.info('Lis Server -> received raw data:')
    // Here you can handle raw data if needed
    // For now, just echo it back
    socket.write(Buffer.from([ASCII_BUFFERS.ACK]))
  }

 }

/**
 * Handles incoming data from clients
 */
const handleData = (socket, data) => {
  const messageType = data[0]

  if (messageType === null || messageType === undefined) {
    log.warn('Lis Server -> received empty data, sending NAK')
    return socket.write(Buffer.from([ASCII_BUFFERS.NAK]))
  }

  const handler = messageHandlers[messageType]

  if (handler) {
    return handler(socket)
  }

  return messageHandlers['raw'] (socket, data)
}

/**
 * Creates a laboratory equipment simulator server
 */
const LisServer = () => {
  const server = net.createServer((socket) => {
    log.info(`Lis Server -> new client connected: ${socket.remoteAddress}`)

    socket.on('data', (data) => handleData(socket, data))

    socket.on('error', (err) => {
      log.error('Lis Server -> socket error:', err.message)
    })

    socket.on('close', () => {
      log.info('Lis Server -> client disconnected')
    })

    socket.on('end', () => {
      log.info('Lis Server -> connection ended')
    })
  })

  server.on('close', () => {
    log.info('Lis Server -> server closed')
  })

  return server
}

module.exports = LisServer
