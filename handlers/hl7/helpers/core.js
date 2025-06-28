/**
 * @fileoverview Core utilities for HL7 message processing and parsing.
 *
 * This module provides essential functions for handling HL7 (Health Level 7) messages,
 * including MLLP (Minimal Lower Layer Protocol) framing operations, message validation,
 * character unescaping, and message parsing into segments.
 *
 * @author Lab Proxy System
 * @version 1.0.0
 */

const { HL7_FRAMING } = require("../../../shared/buffers")

/**
 * Remove MLLP (Minimal Lower Layer Protocol) framing characters from HL7 message.
 * Removes the start block character and end block characters to extract the pure HL7 message content.
 *
 * @param {Buffer} rawMessage - The raw HL7 message buffer with MLLP framing
 * @returns {string} The cleaned HL7 message as a UTF-8 string, or empty string if invalid
 * @example
 * // Returns cleaned HL7 message string
 * const cleaned = removeMllpFraming(buffer);
 */
const removeMllpFraming = (rawMessage) => {

    if (!isValidMessage(rawMessage)) {
        return ""
    }

    const cleaned = rawMessage[0] === HL7_FRAMING.START_BLOCK[0]
        ? rawMessage.subarray(1)
        : rawMessage

    const stringMessage = cleaned.subarray(0, -HL7_FRAMING.END_BLOCK.length)
        .toString('utf8')

    return stringMessage
}

/**
 * Unescape HL7 special characters according to HL7 encoding rules.
 * Converts HL7 escape sequences back to their original characters:
 * - \F\ → | (field separator)
 * - \S\ → ^ (component separator)
 * - \T\ → & (subcomponent separator)
 * - \R\ → ~ (repetition separator)
 * - \E\ → \ (escape character)
 *
 * @param {string} text - The HL7 text containing escape sequences
 * @returns {string} The unescaped text with original characters restored
 * @example
 * // Returns "MSH|^~\&|"
 * const unescaped = unescapeHL7("MSH\\F\\\\S\\\\R\\\\T\\\\E\\");
 */
const unescapeHL7 = (text) => {
    if (!text) return ''

    return text
        .replace(/\\F\\/g, '|')
        .replace(/\\S\\/g, '^')
        .replace(/\\T\\/g, '&')
        .replace(/\\R\\/g, '~')
        .replace(/\\E\\/g, '\\')
}

/**
 * Parse raw HL7 message into individual segments.
 * Removes MLLP framing and splits the message by segment separators (carriage return).
 * Filters out empty segments to ensure clean parsing.
 *
 * @param {Buffer} rawMessage - The raw HL7 message buffer with MLLP framing
 * @returns {string[]} Array of HL7 segments (MSH, PID, OBR, etc.)
 * @example
 * // Returns ["MSH|^~\&|...", "PID|1||...", "OBR|1|..."]
 * const segments = parseMessage(buffer);
 */
const parseMessage = (rawMessage) => {

    return removeMllpFraming(rawMessage)
        .split((String.fromCharCode(HL7_FRAMING.SEGMENT_SEPARATOR[0])))
        .filter(segment => segment.trim().length > 0)
}

/**
 * Validate HL7 message structure by checking MLLP framing.
 * Ensures the message has proper start block (0x0B) and end block (0x1C + 0x0D) characters
 * according to the MLLP (Minimal Lower Layer Protocol) specification.
 *
 * @param {Buffer} rawMessage - The raw message buffer to validate
 * @returns {boolean} True if the message has valid MLLP framing, false otherwise
 * @example
 * // Returns true for properly framed HL7 message
 * const isValid = isValidMessage(buffer);
 */
const isValidMessage = (rawMessage) => {

    const hasStartBlock = rawMessage[0] === HL7_FRAMING.START_BLOCK[0]

    // Get last 2 bytes to compare with END_BLOCK
    const endBytes = rawMessage.subarray(-2)
    const hasEndBlock = Buffer.compare(endBytes, HL7_FRAMING.END_BLOCK) === 0

    return hasStartBlock && hasEndBlock
}

/**
 * @module HL7Core
 * @description Exported functions for HL7 message processing
 */
module.exports = {
    removeMllpFraming,
    unescapeHL7,
    parseMessage,
    isValidMessage
}
