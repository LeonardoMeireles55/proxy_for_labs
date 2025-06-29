/**
 * @fileoverview ASCII Control Character Constants and Protocol Framing Utilities
 * This module provides comprehensive constants for ASCII control characters
 * and protocol-specific framing constants for HL7 and ASTM communication protocols.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

/**
 * ASCII control character constants used in medical device communication protocols
 * These characters are fundamental to ASTM and HL7 protocol implementations
 *
 * @typedef {Object} ASCIIBuffers
 * @property {number} SOH - Start of Header (0x01)
 * @property {number} STX - Start of Text (0x02) - ASTM: beginning of data frame
 * @property {number} ETX - End of Text (0x03) - ASTM: end of frame with checksum
 * @property {number} EOT - End of Transmission (0x04) - ASTM: end of transmission
 * @property {number} ENQ - Enquiry (0x05) - ASTM: handshake to start communication
 * @property {number} ACK - Acknowledge (0x06) - ASTM: positive acknowledgment
 * @property {number} BEL - Bell (0x07) - generally not used in protocols
 * @property {number} BS - Backspace (0x08)
 * @property {number} HT - Horizontal Tab (0x09)
 * @property {number} LF - Line Feed (0x0A) - rarely used; HL7 ignores, ASTM may use
 * @property {number} VT - Vertical Tab (0x0B) - HL7: start of block <SB>
 * @property {number} FF - Form Feed (0x0C)
 * @property {number} CR - Carriage Return (0x0D) - HL7: end of segment, ASTM: end of frame
 * @property {number} DLE - Data Link Escape (0x10)
 * @property {number} DC1 - Device Control 1 (0x11)
 * @property {number} DC2 - Device Control 2 (0x12)
 * @property {number} DC3 - Device Control 3 (0x13)
 * @property {number} DC4 - Device Control 4 (0x14)
 * @property {number} NAK - Negative Acknowledge (0x15) - ASTM: error acknowledgment
 * @property {number} SYN - Synchronous Idle (0x16)
 * @property {number} ETB - End of Transmission Block (0x17) - ASTM: continuation of long message
 * @property {number} CAN - Cancel (0x18)
 * @property {number} EM - End of Medium (0x19)
 * @property {number} SUB - Substitute (0x1A)
 * @property {number} ESC - Escape (0x1B)
 * @property {number} FS - File Separator (0x1C) - HL7: end of block <EB>
 * @property {number} GS - Group Separator (0x1D)
 * @property {number} RS - Record Separator (0x1E)
 * @property {number} US - Unit Separator (0x1F)
 */
const ASCII_BUFFERS = {
  SOH: 0x01, // Start of Header
  STX: 0x02, // Start of Text (ASTM: beginning of data frame)
  ETX: 0x03, // End of Text (ASTM: end of frame with checksum)
  EOT: 0x04, // End of Transmission (ASTM: end of transmission)
  ENQ: 0x05, // Enquiry (ASTM: handshake to start communication)
  ACK: 0x06, // Acknowledge (ASTM: positive acknowledgment)
  BEL: 0x07, // Bell (generally not used in protocols)
  BS: 0x08, // Backspace
  HT: 0x09, // Horizontal Tab
  LF: 0x0a, // Line Feed (rarely used; HL7 ignores, ASTM may use)
  VT: 0x0b, // Vertical Tab
  FF: 0x0c, // Form Feed
  CR: 0x0d, // Carriage Return
  DLE: 0x10, // Data Link Escape
  DC1: 0x11, // Device Control 1
  DC2: 0x12, // Device Control 2
  DC3: 0x13, // Device Control 3
  DC4: 0x14, // Device Control 4
  NAK: 0x15, // Negative Acknowledge
  SYN: 0x16, // Synchronous Idle
  ETB: 0x17, // End of Transmission Block
  CAN: 0x18, // Cancel
  EM: 0x19, // End of Medium
  SUB: 0x1a, // Substitute
  ESC: 0x1b, // Escape
  FS: 0x1c, // File Separator
  GS: 0x1d, // Group Separator
  RS: 0x1e, // Record Separator
  US: 0x1f // Unit Separator
};
/** * HL7 protocol field separators
 * Used to parse HL7 messages into segments, fields, components, and subcomponents
 *
 * @typedef {Object} HL7Separators
 * @property {string} FIELD - Field separator (|)
 * @property {string} COMPONENT - Component separator (^)
 * @property {string} SUBCOMPONENT - Subcomponent separator (&)
 * @property {string} REPEAT - Repetition separator (~)
 * @property {string} ESCAPE - Escape character (\)
 */
const HL7_SEPARATORS = {
  FIELD: '|',
  COMPONENT: '^',
  SUBCOMPONENT: '&',
  REPEAT: '~',
  ESCAPE: '\\'
};

/**
 * HL7 protocol framing constants
 * Used for HL7 message structure and block delimitation
 *
 * @typedef {Object} HL7Framing
 * @property {number} START_BLOCK - Vertical Tab (0x0B) - beginnings of block
 * @property {number} END_BLOCK - File Separator (0x1C) + Carriage Return (0x0D) - end of block
 * @property {number} SEGMENT_SEPARATOR - Carriage Return (0x0D) - end of segment
 */
const HL7_FRAMING = {
  START_BLOCK: Buffer.from([ASCII_BUFFERS.VT]),

  SEGMENT_SEPARATOR: Buffer.from([ASCII_BUFFERS.CR]),

  FILE_SEPARATOR: Buffer.from([ASCII_BUFFERS.FS]),

  END_BLOCK: Buffer.from([ASCII_BUFFERS.FS, ASCII_BUFFERS.CR]) // HL7 block end: <FS><CR>
};

/** * MLLP framing constants for HL7 messages
 * Used to encapsulate HL7 messages in MLLP framing
 * MLLP (Minimal Lower Layer Protocol) is a simple framing protocol for HL7 messages
 *
 */
const MLLP_START = String.fromCharCode(ASCII_BUFFERS.VT); // <VT>

const MLLP_END =
  String.fromCharCode(ASCII_BUFFERS.FS) + String.fromCharCode(ASCII_BUFFERS.CR); //<FS><CR>

/**
 * Message structure as string constants
 * Used to represent HL7 message structure in a human-readable format
 *
 * @typedef {Object} MessageStructureAsString
 * @property {string} START_BLOCK - Start Block character as string
 * @property {string} SEGMENT_SEPARATOR - Segment separator as string
 * @property {string} FILE_SEPARATOR - File separator as string
 * @property {string} END_BLOCK - Message end as string
 */
const MESSAGE_STRUCTURE_AS_STRING = {
  START_BLOCK: '<VT>', // Start Block character (Vertical Tab)
  SEGMENT_SEPARATOR: '<CR>', // Carriage Return (segment separator)
  FILE_SEPARATOR: '<FS>', // File Separator
  END_BLOCK: '<FS><CR>' // Message end: <FS><CR>
};

/**
 * Convert message structure characters to ASCII buffers
 * Used to convert human-readable message structure to ASCII control characters
 * @param {string} character - Character to convert
 * @returns {Buffer} ASCII buffer representation of the character
 */
const convertMessageStructureToASCII = (character) => {
  switch (character) {
    case MESSAGE_STRUCTURE_AS_STRING.START_BLOCK:
      return HL7_FRAMING.START_BLOCK;
    case MESSAGE_STRUCTURE_AS_STRING.SEGMENT_SEPARATOR:
      return HL7_FRAMING.SEGMENT_SEPARATOR;
    case MESSAGE_STRUCTURE_AS_STRING.FILE_SEPARATOR:
      return HL7_FRAMING.FILE_SEPARATOR;
    case MESSAGE_STRUCTURE_AS_STRING.END_BLOCK:
      return HL7_FRAMING.END_BLOCK;

    default:
      return Buffer.from(character);
  }
};

/**
 * ASTM protocol framing constants
 * Used for ASTM message structure, handshaking, and frame delimitation
 *
 * @typedef {Object} ASTMFraming
 * @property {number} START_FRAME - Start of Text (0x02) - beginning of frame data
 * @property {number} END_FRAME - End of Text (0x03) - end of frame with checksum
 * @property {number} END_TRANSMISSION - end of Transmission (0x04) - end of transmission
 * @property {number} HANDSHAKE_ENQ - Enquiry (0x05) - handshake to start communication
 * @property {number} HANDSHAKE_ACK - Acknowledge (0x06) - positive acknowledge
 * @property {number} HANDSHAKE_NAK - Negative Acknowledge (0x15) - acknowledge error
 * @property {number} FRAME_END - Carriage Return (0x0D) - end of frame
 * @property {number} MULTIPART_END - End of Transmission Block (0x17) - continuation of long message
 */
const ASTM_FRAMING = {
  START_FRAME: ASCII_BUFFERS.STX,
  END_FRAME: ASCII_BUFFERS.ETX,
  END_TRANSMISSION: ASCII_BUFFERS.EOT,
  HANDSHAKE_ENQ: ASCII_BUFFERS.ENQ,
  HANDSHAKE_ACK: ASCII_BUFFERS.ACK,
  HANDSHAKE_NAK: ASCII_BUFFERS.NAK,
  FRAME_END: ASCII_BUFFERS.CR,
  MULTIPART_END: ASCII_BUFFERS.ETB
};

module.exports = {
  ASCII_BUFFERS,
  HL7_FRAMING,
  ASTM_FRAMING,
  MESSAGE_STRUCTURE_AS_STRING,
  HL7_SEPARATORS,
  MLLP_START,
  MLLP_END,
  convertMessageStructureToASCII
};
