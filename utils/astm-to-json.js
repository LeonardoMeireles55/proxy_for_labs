/**
 * @fileoverview ASTM Message to JSON Converter
 * This module provides functionality to convert ASTM protocol messages
 * into structured JSON objects for easier processing and analysis.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const log = require('./logger')
const { astmFraming } = require('./buffers')

/**
 * Represents a parsed ASTM segment with structured fields
 * @typedef {Object} ASTMSegment
 * @property {string} recordType - The ASTM record type (H, P, O, R, etc.)
 * @property {string} sequenceNumber - The sequence number of the record
 * @property {Array<string|Array<string>>} fields - Array of field values, components split by '^'
 */

/**
 * Represents the result of ASTM message parsing
 * @typedef {Object} ASTMParseResult
 * @property {string} messageType - Type of message: 'ASTM Control Message', 'ASTM Data Message', or 'Raw Data'
 * @property {Array<string>} [controlCharacters] - Array of control character descriptions (for control messages)
 * @property {Array<ASTMSegment>} [segments] - Array of parsed data segments (for data messages)
 * @property {string} rawHex - Hexadecimal representation of the raw buffer
 * @property {Buffer} rawBuffer - Original raw buffer data
 * @property {string} [interpretation] - Human-readable interpretation (for control messages)
 * @property {string} [rawString] - String representation of the data (for data messages)
 */

/**
 * Converts ASTM messages (both control and data messages) to structured JSON objects
 * Handles ASTM framing, control characters, and data segment parsing with field components
 *
 * @function astmToJson
 * @param {Buffer|string} astmMessage - The ASTM message to parse (Buffer or string)
 * @param {string} [encoding='latin1'] - Character encoding to use for string conversion
 * @returns {ASTMParseResult} Parsed ASTM message as structured JSON object
 */
function astmToJson(astmMessage, encoding = 'latin1') {
    // Handle both Buffer and string inputs
    let rawBuffer
    if (Buffer.isBuffer(astmMessage)) {
        rawBuffer = astmMessage
    } else {
        rawBuffer = Buffer.from(astmMessage.toString(), 'latin1')
    }
    const dataString = rawBuffer.toString('latin1')

    // Check for ASTM control characters
    const controlChars = {
        [astmFraming.HANDSHAKE_ENQ]: 'ENQ (Enquiry)',
        [astmFraming.HANDSHAKE_ACK]: 'ACK (Acknowledge)',
        [astmFraming.HANDSHAKE_NAK]: 'NAK (Negative Acknowledge)',
        [astmFraming.END_TRANSMISSION]: 'EOT (End of Transmission)',
        [astmFraming.START_FRAME]: 'STX (Start of Text)',
        [astmFraming.END_FRAME]: 'ETX (End of Text)',
        [astmFraming.MULTIPART_END]: 'ETB (End of Transmission Block)',
        [astmFraming.FRAME_END]: 'CR (Carriage Return)'
    }

    // Display raw hex for debugging
    const hexString = Array.from(rawBuffer)
        .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(' ')

    // Check if message contains only control characters
    const isControlMessage = rawBuffer.length <= 4 && Array.from(rawBuffer).every(byte =>
        Object.keys(controlChars).includes(byte.toString())
    )

    if (isControlMessage) {
        const controlTypes = Array.from(rawBuffer).map(byte =>
            controlChars[byte] || `Unknown (0x${byte.toString(16).toUpperCase()})`
        )

        const results = {
            messageType: 'ASTM Control Message',
            controlCharacters: controlTypes,
            rawHex: hexString,
            rawBuffer: rawBuffer,
            interpretation: controlTypes.join(', ')
        }

        log.debug('ASTM control message parsed:', results)
        return results
    }

    // Parse data messages (with STX/ETX framing)
    const segments = []
    const lines = dataString.split(/[\r\n]+/).filter(line => line.length > 0)

    lines.forEach(line => {
        // Remove framing characters if present
        let cleanLine = line
        if (line.charCodeAt(0) === astmFraming.START_FRAME) {
            cleanLine = line.substring(1)
        }
        if (cleanLine.charCodeAt(cleanLine.length - 1) === astmFraming.END_FRAME) {
            cleanLine = cleanLine.substring(0, cleanLine.length - 1)
        }

        // Parse ASTM segments (pipe-delimited)
        if (cleanLine.includes('|')) {
            const parts = cleanLine.split('|')
            segments.push({
                recordType: parts[0],
                sequenceNumber: parts[1] || '',
                fields: parts.slice(2).map(field => {
                    // Handle component separators (^)
                    return field.includes('^') ? field.split('^') : field
                })
            })
        }
    })

    const results = {
        messageType: segments.length > 0 ? 'ASTM Data Message' : 'Raw Data',
        segments: segments,
        rawHex: hexString,
        rawBuffer: rawBuffer,
        rawString: dataString
    }

    log.debug('ASTM message parsed:', results)
    return results
}

module.exports = { astmToJson };
