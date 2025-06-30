const log = require('../../../../configs/logger');
const net = require('node:net');
const {
  removeMllpFraming,
  parseMshSegment,
  parseRawHL7ToString
} = require('./parser');

const hl7Message = [
  'MSH|^~\\&|Informatics|161387862^Quest Diagnostics^L||LABGATEWAY^UnitedHealth Group^L|20190917010635-0600||ORU^R01^ORU_R01|M1926001063500000963|P|2.5||||||||',
  'PID|1||820154899^^^^HC||BEIGHE^DENISE^I^^^^L||19600415|F|||3174 E DESERT BROOM WAY^^PHOENIX^AZ^85048^^M||(623)252-1760',
  'OBR|1||PHO2019081541408081|83036^^C4^9230^Hemoglobin A1c With eAG^L|||20190815000000-0600|||||||||1225300882^ZAMANI^SAMIRA^^^^^^NPI||||||20190815215000-0600|||F',
  'OBX|1|NM|4548-4^Hemoglobin A1c^LN^10009230^Hemoglobin A1c^L||5.2|%^^ISO+|||||F',
  "NTE|1|L|The American Diabetes Association (ADA) guidelines for interpreting Hemoglobin A1c are as follows: Non-Diabetic patient: <=5.6% ~ Increased risk for future Diabetes: 5.7-6.4% ~ ADA diagnostic criteria for Diabetes: >=6.5% ~ Values for patients with Diabetes: Meets ADA's recommended goal for therapy: <7.0% ~ Exceeds ADA's recommended goal: 7.0-8.0% ~ ADA recommends reevaluation of therapy: >8.0%",
  'OBX|2|NM|27353-2^Estimated Average Glucose (eAG)^LN^12009230^Estimated Average Glucose (eAG)^L||103|^^ISO+|Not Established||||F',
  'FT1|1|||20190815||CG|83036^^C4^9230^Hemoglobin A1c With eAG^L|||||||705963^United Healthcare^HC|||||||||||83036^^C4^9230^Hemoglobin A1c With eAG^L'
].join('\r');

const MLLP_START = String.fromCharCode(0x0b); // <VT>

const MLLP_END = String.fromCharCode(0x1c) + String.fromCharCode(0x0d); //<FS><CR>

const FULL_MESSAGE_MOCK = MLLP_START + hl7Message + MLLP_END;

// Mock HL7 message buffer with MLLP framing

const BUFFER_MOCK = Buffer.from(FULL_MESSAGE_MOCK, 'utf-8');

const HL7_MOCK_BUFFER = BUFFER_MOCK;

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
  HL7_MOCK_BUFFER,
  createAcknowledgment,
  sendHL7Acknowledgment
};
