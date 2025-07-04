/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using ASTM protocol.
 * It handles basic ASTM handshaking and can be used for testing proxy functionality.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net');
const { ASCII_BUFFERS } = require('../../handlers/utils/buffers')
const log = require('../../../configs/logger')

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
    log.debug(`New client connected: ${socket.remoteAddress}`);

    // Send initial ENQ to start communication
    setTimeout(() => {
      log.debug('Sending ENQ to start communication');
      socket.write(Buffer.from([ASCII_BUFFERS.ENQ]));
    }, 1000);

    socket.on('data', (data) => {
      log.debug(`Received data: ${data.toString('latin1')}`);

      if (data[0] === ASCII_BUFFERS.ENQ) {
        log.debug('Received ENQ, sending ACK');

        socket.write(Buffer.from([ASCII_BUFFERS.ACK]));
      }

      if (data[0] === ASCII_BUFFERS.ACK) {
        log.debug('Received ACK, ready for data transmission');
      } else {
        log.debug('Echoing data back');
        socket.write(Buffer.from([ASCII_BUFFERS.ACK]));
      }
    });

    socket.on('error', (err) => {
      log.error('Socket error:', err.message);
    });

    socket.on('close', () => {
      log.debug('Client disconnected');
    });
  });
};

module.exports = createEquipmentServerASTM;
