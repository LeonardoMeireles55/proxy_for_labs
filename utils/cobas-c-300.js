/**
 * @fileoverview Cobas C-300 HL7 Message Processing Utilities
 * This module provides specific utilities for processing HL7 v2.x messages
 * from Cobas Pure C300 laboratory equipment, including parsing, validation, and decoding.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const { hl7Framing } = require('./buffers')

/**
 * HL7 v2.x delimiter characters used in Cobas Pure C300 communication
 * @typedef {Object} HL7Delimiters
 * @property {string} FIELD_SEPARATOR - Field separator character '|'
 * @property {string} COMPONENT_SEPARATOR - Component separator character '^'
 * @property {string} REPETITION_SEPARATOR - Repetition separator character '~'
 * @property {string} ESCAPE_CHARACTER - Escape character '\'
 * @property {string} SUBCOMPONENT_SEPARATOR - Subcomponent separator character '&'
 */

/**
 * HL7 v2.x encoding characters for Cobas Pure C300
 * @type {HL7Delimiters}
 */
const HL7_DELIMITERS = {
    FIELD_SEPARATOR: '|',
    COMPONENT_SEPARATOR: '^',
    REPETITION_SEPARATOR: '~',
    ESCAPE_CHARACTER: '\\',
    SUBCOMPONENT_SEPARATOR: '&'
}

/**
 * HL7 escape sequences mapping as per HL7 specification
 * Used to escape special characters within HL7 message data
 * @type {Object<string, string>}
 */
const ESCAPE_SEQUENCES = {
    '|': '\\F\\',  // Field separator -> \F\
    '^': '\\S\\',  // Component separator -> \S\
    '&': '\\T\\',  // Subcomponent separator -> \T\
    '~': '\\R\\',  // Repetition separator -> \R\
    '\\': '\\E\\'  // Escape character -> \E\
}

/**
 * Decodes HL7 escape sequences in a text string
 * Converts HL7 escape sequences back to their original delimiter characters
 *
 * @function decodeHL7String
 * @param {string} text - The HL7 encoded text string to decode
 * @returns {string} Decoded text with escape sequences converted back to delimiters
 */
const decodeHL7String = (text) => {
    if (!text || typeof text !== 'string') return text

    let decoded = text
    // Decode in reverse order
    Object.entries(ESCAPE_SEQUENCES).reverse().forEach(([char, escape]) => {
        decoded = decoded.replace(new RegExp(escape.replace(/\\/g, '\\\\'), 'g'), char)
    })

    return decoded
}

/**
 * Parses an HL7 message into segments and fields
 * Removes framing characters and splits the message into its component segments
 *
 * @function parseHL7Message
 * @param {string} rawMessage - The raw HL7 message string including framing
 * @returns {Array<Array<string>>|null} Array of segments, each containing fields, or null if invalid
 */
const parseHL7Message = (rawMessage) => {
    if (!rawMessage) return null

    // Remove framing characters
    let message = rawMessage
    if (message.charCodeAt(0) === hl7Framing.START_BLOCK) {
        message = message.slice(1)
    }

    const endBlockIndex = message.indexOf(String.fromCharCode(hl7Framing.END_BLOCK))
    if (endBlockIndex !== -1) {
        message = message.slice(0, endBlockIndex)
    }

    // Split into segments
    const segments = message.split(String.fromCharCode(hl7Framing.SEGMENT_SEPARATOR))
        .filter(segment => segment.trim().length > 0)
        .map(segment => segment.split(HL7_DELIMITERS.FIELD_SEPARATOR))

    return segments
}

/**
 * Validates the structure of an HL7 message
 * Checks for proper framing characters and required MSH segment
 *
 * @function validateHL7Message
 * @param {string} message - The HL7 message string to validate
 * @returns {boolean} True if the message structure is valid, false otherwise
 */
const validateHL7Message = (message) => {
    if (!message) return false

    // Check for proper framing
    const hasStartBlock = message.charCodeAt(0) === hl7Framing.START_BLOCK
    const hasEndBlock = message.includes(String.fromCharCode(hl7Framing.END_BLOCK))    // Check for MSH segment (required first segment)
    const segments = parseHL7Message(message)
    const hasMSH = segments && segments.length > 0 && segments[0][0] === 'MSH'

    return hasStartBlock && hasEndBlock && !!hasMSH
}

module.exports = {
    decodeHL7String,
    parseHL7Message,
    validateHL7Message,
    HL7_DELIMITERS,
    ESCAPE_SEQUENCES
}
