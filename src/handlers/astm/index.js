/**
 * @fileoverview ASTM Protocol Message Parser and Utilities
 * This module provides functionality to parse ASTM (American Society for Testing and Materials)
 * messages used in laboratory equipment communication, including control characters and data frames.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const { ASCII_BUFFERS } = require('../utils/buffers');

/**
 * Represents a parsed ASTM message segment
 * @typedef {Object} ASTMSegment
 * @property {string} recordType - The record type identifier (H, P, O, R, etc.)
 * @property {string} sequenceNumber - The sequence number of the record
 * @property {Array<string>} fields - Array of data fields from the record
 */

/**
 * Represents a parsed ASTM message
 * @typedef {Object} ASTMMessage
 * @property {string} type - Message type: 'control', 'data', or 'raw'
 * @property {string} [message] - Human-readable description for control messages
 * @property {Array<ASTMSegment>} [segments] - Parsed data segments for data messages
 * @property {Buffer} raw - Original raw buffer data
 * @property {string} hex - Hexadecimal representation of the buffer
 * @property {string} [text] - Text representation of the message
 */

/**
 * Parses an ASTM message buffer into structured data
 * Handles both control characters (ENQ, ACK, NAK, etc.) and data messages with STX/ETX framing
 *
 * @function parseAstmMessage
 * @param {Buffer} buffer - Raw buffer containing ASTM message data
 * @returns {ASTMMessage} Parsed ASTM message object with type and content
 */
const parseAstmMessage = (buffer) => {
  const hexString = Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // Check for control characters
  const controlMessages = {
    [ASCII_BUFFERS.ENQ]: 'ENQ (Enquiry - Start Communication)',
    [ASCII_BUFFERS.ACK]: 'ACK (Acknowledge - Positive Response)',
    [ASCII_BUFFERS.NAK]: 'NAK (Negative Acknowledge - Error)',
    [ASCII_BUFFERS.EOT]: 'EOT (End of Transmission)',
    [ASCII_BUFFERS.STX]: 'STX (Start of Text)',
    [ASCII_BUFFERS.ETX]: 'ETX (End of Text)',
    [ASCII_BUFFERS.CR]: 'CR (Carriage Return)'
  };

  // Single control character messages
  if (buffer.length === 1 && controlMessages[buffer[0]]) {
    return {
      type: 'control',
      message: controlMessages[buffer[0]],
      raw: buffer,
      hex: hexString
    };
  }

  // Data messages (with STX/ETX framing)
  const dataString = buffer.toString('latin1');
  let cleanData = dataString;

  // Remove framing if present
  if (cleanData.charCodeAt(0) === ASCII_BUFFERS.STX) {
    cleanData = cleanData.substring(1);
  }
  if (cleanData.charCodeAt(cleanData.length - 1) === ASCII_BUFFERS.ETX) {
    cleanData = cleanData.substring(0, cleanData.length - 1);
  }

  // Parse pipe-delimited segments
  const segments = [];
  if (cleanData.includes('|')) {
    const parts = cleanData.split('|');
    segments.push({
      recordType: parts[0] || '',
      sequenceNumber: parts[1] || '',
      fields: parts.slice(2)
    });
  }

  return {
    type: segments.length > 0 ? 'data' : 'raw',
    segments,
    raw: buffer,
    hex: hexString,
    text: dataString
  };
};

/**
 * Sample ASTM messages for testing and development
 * @typedef {Object} SampleMessages
 * @property {Buffer} ENQ - Enquiry control message
 * @property {Buffer} ACK - Acknowledge control message
 * @property {Buffer} NAK - Negative acknowledge control message
 * @property {Buffer} EOT - End of transmission control message
 * @property {string} header - Sample header record with system information
 * @property {string} patient - Sample patient record with demographics
 * @property {string} order - Sample order record with test information
 * @property {string} result - Sample result record with test values
 */

/**
 * Creates sample ASTM messages for testing and development purposes
 * Includes both control characters and properly formatted data records
 *
 * @function createSampleMessages
 * @returns {SampleMessages} Object containing various sample ASTM messages
 */
const createSampleMessages = () => ({
  ENQ: Buffer.from([ASCII_BUFFERS.ENQ]),
  ACK: Buffer.from([ASCII_BUFFERS.ACK]),
  NAK: Buffer.from([ASCII_BUFFERS.NAK]),
  EOT: Buffer.from([ASCII_BUFFERS.EOT]),

  // Sample data records
  header: `${String.fromCharCode(
    ASCII_BUFFERS.STX
  )}H|\\^&|||LIS^Host^1.0.0||||||P|LIS02-A2|${new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14)}${String.fromCharCode(ASCII_BUFFERS.ETX)}`,
  patient: `${String.fromCharCode(
    ASCII_BUFFERS.STX
  )}P|1||12345||DOE^JOHN||19800101|M|||||||||||||||||||${String.fromCharCode(
    ASCII_BUFFERS.ETX
  )}`,
  order: `${String.fromCharCode(
    ASCII_BUFFERS.STX
  )}O|1|12345||^^^GLU|||${new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14)}||||||||||||||||||F${String.fromCharCode(ASCII_BUFFERS.ETX)}`,
  result: `${String.fromCharCode(
    ASCII_BUFFERS.STX
  )}R|1|^^^GLU|120|mg/dL||N||F||||${new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14)}${String.fromCharCode(ASCII_BUFFERS.ETX)}`
});

/**
 * Creates mock ASTM messages for simulation and debugging purposes
 * Provides a comprehensive set of realistic ASTM messages including various record types,
 * error scenarios, and edge cases for thorough testing of the proxy system.
 *
 * @function mockMessages
 * @returns {Object} Object containing categorized mock ASTM messages
 */
const mockMessages = () => {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

  return {
    // Control messages for handshaking
    control: {
      enq: Buffer.from([ASCII_BUFFERS.ENQ]),
      ack: Buffer.from([ASCII_BUFFERS.ACK]),
      nak: Buffer.from([ASCII_BUFFERS.NAK]),
      eot: Buffer.from([ASCII_BUFFERS.EOT]),
      stx: Buffer.from([ASCII_BUFFERS.STX]),
      etx: Buffer.from([ASCII_BUFFERS.ETX])
    },

    // Basic ASTM record types
    records: {
      header: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}H|\\^&|||MockEquipment^v2.1.0^12345||||||P|E1394-97|${timestamp}${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      patient: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}P|1||PATIENT001||SMITH^JOHN^MICHAEL||19850315|M|||123 Main St^Apt 4B^Boston^MA^02101|||||||||||${timestamp}${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      order: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}O|1|ORDER001||^^^GLU^Glucose|||${timestamp}|||||A||||1||||||F||${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      result: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^GLU^Glucose|95.5|mg/dL|70.0^110.0|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      comment: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}C|1|I|Sample processed successfully|G${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      terminator: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}L|1|N${String.fromCharCode(ASCII_BUFFERS.ETX)}`
    },

    // Multi-test results
    multiTest: {
      chemistry: [
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|1|^^^GLU^Glucose|95.5|mg/dL|70.0^110.0|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|2|^^^CHOL^Cholesterol|185|mg/dL|<200.0||N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|3|^^^TRIG^Triglycerides|142|mg/dL|<150.0||N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`
      ],

      hematology: [
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|1|^^^WBC^White Blood Cells|7.2|K/uL|4.0^11.0|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|2|^^^RBC^Red Blood Cells|4.5|M/uL|4.2^5.4|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|3|^^^HGB^Hemoglobin|14.2|g/dL|12.0^16.0|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`
      ]
    },

    // Abnormal results for testing
    abnormal: {
      highGlucose: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^GLU^Glucose|250.0|mg/dL|70.0^110.0|H||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      lowSodium: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^NA^Sodium|125|mmol/L|136.0^145.0|L||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      criticalPotassium: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^K^Potassium|6.8|mmol/L|3.5^5.1|H*||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`
    },

    // Error scenarios
    errors: {
      sampleError: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^GLU^Glucose||mg/dL|||E|Sample hemolyzed|F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      instrumentError: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}C|1|I|Instrument maintenance required - contact service|G${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      qcFailure: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|1|^^^QCGLU^QC Glucose|OUT OF RANGE||90.0^110.0|A||Q||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`
    },

    // Complete message sequences
    sequences: {
      normalWorkflow: [
        Buffer.from([ASCII_BUFFERS.ENQ]),
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}H|\\^&|||MockEquipment^v2.1.0^12345||||||P|E1394-97|${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}P|1||PATIENT001||DOE^JANE^||19900101|F${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}O|1|ORDER001||^^^GLU|||${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|1|^^^GLU|98.5|mg/dL|70.0^110.0|N||F||TECH1||${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(ASCII_BUFFERS.STX)}L|1|N${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        Buffer.from([ASCII_BUFFERS.EOT])
      ],

      errorWorkflow: [
        Buffer.from([ASCII_BUFFERS.ENQ]),
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}H|\\^&|||MockEquipment^v2.1.0^12345||||||P|E1394-97|${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}P|1||PATIENT002||ERROR^TEST^||19850101|M${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}O|1|ORDER002||^^^GLU|||${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|1|^^^GLU||mg/dL|||E|Insufficient sample|F||TECH1||${timestamp}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        `${String.fromCharCode(ASCII_BUFFERS.STX)}L|1|N${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`,
        Buffer.from([ASCII_BUFFERS.EOT])
      ]
    },

    // Malformed messages for robustness testing
    malformed: {
      missingSTX: `H|\\^&|||MockEquipment^v2.1.0^12345||||||P|E1394-97|${timestamp}${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      missingETX: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}H|\\^&|||MockEquipment^v2.1.0^12345||||||P|E1394-97|${timestamp}`,

      invalidSequence: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}R|999|^^^GLU^Glucose|95.5|mg/dL|70.0^110.0|N||F||OPERATOR1||${timestamp}|INST001${String.fromCharCode(
        ASCII_BUFFERS.ETX
      )}`,

      truncatedMessage: `${String.fromCharCode(
        ASCII_BUFFERS.STX
      )}P|1||PATIENT001||SMI`,

      corruptedData: Buffer.from([
        ASCII_BUFFERS.STX,
        0xff,
        0xfe,
        0xfd,
        ASCII_BUFFERS.ETX
      ])
    },

    // Utility functions for generating dynamic content
    generators: {
      /**
       * Generates a patient record with random data
       * @param {number} patientId - Patient identifier
       * @returns {string} ASTM patient record
       */
      randomPatient: (patientId = 1) => {
        const names = [
          'SMITH^JOHN',
          'DOE^JANE',
          'JOHNSON^MIKE',
          'BROWN^LISA',
          'DAVIS^ROBERT'
        ];
        const genders = ['M', 'F'];
        const name = names[Math.floor(Math.random() * names.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const birthYear = 1950 + Math.floor(Math.random() * 50);

        return `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}P|${patientId}||PAT${String(patientId).padStart(
          3,
          '0'
        )}||${name}||${birthYear}0101|${gender}${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`;
      },

      /**
       * Generates a result with specified value and reference range
       * @param {number} seqNum - Sequence number
       * @param {string} testCode - Test code
       * @param {number} value - Test value
       * @param {string} units - Units
       * @param {string} refRange - Reference range
       * @returns {string} ASTM result record
       */
      customResult: (seqNum, testCode, value, units, refRange) => {
        const flag =
          value < parseFloat(refRange.split('^')[0])
            ? 'L'
            : value > parseFloat(refRange.split('^')[1])
            ? 'H'
            : 'N';

        return `${String.fromCharCode(
          ASCII_BUFFERS.STX
        )}R|${seqNum}|^^^${testCode}|${value}|${units}|${refRange}|${flag}||F||TECH1||${timestamp}|INST001${String.fromCharCode(
          ASCII_BUFFERS.ETX
        )}`;
      }
    }
  };
};

module.exports = {
  parseAstmMessage,
  createSampleMessages,
  mockMessages
};
