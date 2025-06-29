/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using ASTM protocol.
 * It handles basic ASTM handshaking and can be used for testing proxy functionality.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const { ASCII_BUFFERS } = require('../../handlers/utils/buffers')
const { handleBuffer } = require('../../handlers/hl7/helpers/handle-buffer')
const { sendHL7Acknowledgment } = require('../../handlers/hl7/helpers/hl7-acknowledgment')
const { parseRawHL7ToString } = require('../../handlers/hl7')
const log = require('../../../configs/logger')

/**
 * ASTM message handlers for LIS server
 */
const messageHandlers = {
  [ASCII_BUFFERS.ENQ]: (socket) => {
    log.debug('Lis Server -> Received ENQ, sending ACK')
    socket.write(Buffer.from([ASCII_BUFFERS.ACK]))
  },

  [ASCII_BUFFERS.ACK]: () => {
    log.debug('Lis Server -> Received ACK, ready for data transmission')
  },

  [ASCII_BUFFERS.EOT]: (socket) => {
    log.debug('Lis Server -> Received EOT, closing connection')
    socket.end()
  },

  ['raw']: (socket, data) => {
    log.debug('Lis Server -> Received raw data:')
    // Here you can handle raw data if needed
    log.debug(`Lis Server -> Data length: ${data.length} bytes`)
    socket.write(data)
  }

 }

/**
 * Handles incoming data from clients
 */
const handleData = (socket, data) => {
  const messageType = data[0]

  if (messageType === null || messageType === undefined) {
    log.warn('Lis Server -> Received empty data, sending NAK')
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

    log.debug(`Lis Server -> Client connected: ${socket.remoteAddress}:${socket.remotePort}`)

    socket.on('data', (data) => {
      log.debug('Lis Server -> Received data from client:', parseRawHL7ToString(data))
      sendHL7Acknowledgment(data, socket)
    })

    socket.on('error', (err) => {
      log.error('Lis Server -> Socket error:', err)
    })

    socket.on('close', () => {
      log.debug('Lis Server -> Client disconnected')
    })

    socket.on('end', () => {
      log.debug('Lis Server -> Connection ended')
    })
  })

  server.on('close', () => {
    log.debug('Lis Server -> Server closed')
  })

  return server
}

module.exports = LisServer
