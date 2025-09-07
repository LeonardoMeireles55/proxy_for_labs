const log = require('../../../../configs/logger');
const net = require('node:net');
const { retrieveHl7MessageData } = require('./hl7-data-extract')

/**
 * Process complete HL7 message and send acknowledgment
 * @param {Buffer} message - Complete HL7 message with MLLP framing
 * @param {net.Socket} socket - Client socket for sending acknowledgment
 */
const processHL7Message = (message, socket) => {

  retrieveHl7MessageData(message);

  socket.write(message);

  log.debug('HL7 message processed successfully');
};

module.exports = { processHL7Message };
