const log = require('../../../../configs/logger');
const net = require('node:net');
const {
  removeMllpFraming,
  parseMshSegment,
  parseRawHL7ToString
} = require('./hl7-parsers');
const { MLLP_START, MLLP_END } = require('../../utils/buffers');

/**
 * Creates MSH segment for acknowledgment messages
 * @param {string} messageControlId - Control ID for this acknowledgment
 * @param {string} processingId - P (Production), T (Test), D (Debug)
 * @param {string} versionId - HL7 version (default: 2.5.1)
 * @param {string} triggerEvent - Trigger event from original message MSH-9-2
 */
const createMSHSegment = (
  messageControlId,
  processingId = 'P',
  versionId = '2.5.1',
  triggerEvent = 'R01'
) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14);
  return [
    'MSH',
    '^~\\&', // MSH-2: Encoding characters
    'HOST', // MSH-3: Sending application
    '', // MSH-4: Sending facility
    'cobaspure', // MSH-5: Receiving application
    '', // MSH-6: Receiving facility
    timestamp, // MSH-7: Date/time of message
    '', // MSH-8: Security
    `ACK^${triggerEvent}^ACK`, // MSH-9: Message type (ACK^<varies>^ACK format)
    messageControlId, // MSH-10: Message control ID
    processingId, // MSH-11: Processing ID
    versionId, // MSH-12: Version ID
    '', // MSH-13: Sequence number
    '', // MSH-14: Continuation pointer
    '', // MSH-15: Accept acknowledgment type
    '', // MSH-16: Application acknowledgment type
    '', // MSH-17: Country code
    'UNICODE UTF-8', // MSH-18: Character set
    '', // MSH-19: Principal language of message
    '', // MSH-20: Alternate character set handling scheme
    '' // MSH-21: Message profile identifier
  ].join('|');
};

/**
 * Creates MSA segment for acknowledgment messages
 * @param {string} ackCode - AA (Accept), AR (Reject), AE (Error)
 * @param {string} messageControlId - From original message MSH-10
 */
const createMSASegment = (ackCode, messageControlId) =>
  `MSA|${ackCode}|${messageControlId}`;

/**
 * Creates complete acknowledgment message
 * @param {string} ackCode - AA, AR, or AE
 * @param {string} originalMessageControlId - From MSH-10 of original message
 * @param {string} processingId - P (Production), T (Test), D (Debug)
 * @param {string} versionId - HL7 version
 * @param {string} triggerEvent - From original message MSH-9-2
 */
const createAcknowledgment = (
  ackCode = 'AA',
  originalMessageControlId = 'M1926001063500000963',
  processingId = 'P',
  versionId = '2.5.1',
  triggerEvent = 'R01'
) => {
  const ackControlId = `ACK${Date.now()}`;

  const msh = createMSHSegment(
    ackControlId,
    processingId,
    versionId,
    triggerEvent
  );

  const msa = createMSASegment(ackCode, originalMessageControlId);

  const buffer = Buffer.from(`${MLLP_START}${msh}\r${msa}${MLLP_END}`, 'utf-8');

  return buffer;
};

/**
 * Send HL7 acknowledgment message to client
 * @param {Buffer} originalMessage - Original HL7 message
 * @param {net.Socket} clientSocket - Client socket
 */
const sendHL7Acknowledgment = (originalMessage, clientSocket) => {
  try {
    // Remove MLLP framing characters (VT start, FS+CR end)
    const cleanMessage = removeMllpFraming(originalMessage);

    // Parse MSH segment to extract required fields
    const { messageControlId, triggerEvent } = parseMshSegment(cleanMessage);

    // Create and send acknowledgment (AA = Application Accept)
    const ack = createAcknowledgment(
      'AA',
      messageControlId,
      'P',
      '2.5.1',
      triggerEvent
    );

    log.debug('Sending HL7 acknowledgment:', parseRawHL7ToString(ack));

    clientSocket.write(ack);
  } catch (error) {
    log.error('Error sending acknowledgment:', error);
  }
};

module.exports = {
  createAcknowledgment,
  sendHL7Acknowledgment
};
