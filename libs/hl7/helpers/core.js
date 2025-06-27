const { MESSAGE_STRUCTURE_AS_STRING, HL7_FRAMING } = require("../../shared/buffers")

/**
 * Remove MLLP framing characters from HL7 message
 */
const removeMllpFraming = (messageStr) => {
    let cleanMessage = messageStr

    if (messageStr.charCodeAt(0) === 0x0B) {
        cleanMessage = messageStr.slice(1)
    }

    if (cleanMessage.charCodeAt(cleanMessage.length - 2) === 0x1C) {
        cleanMessage = cleanMessage.slice(0, -2)
    }

    return cleanMessage
}

/**
 * Unescape HL7 special characters
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
 * Parse raw HL7 message into segments
 */
const parseMessage = (rawMessage) => {
    const message = rawMessage.toString('utf8')
    let cleaned = message.charCodeAt(0) === HL7_FRAMING.START_BLOCK
        ? message.substring(1)
        : message

    cleaned = cleaned.slice(0, -HL7_FRAMING.END_BLOCK)

    return cleaned
        .split(String.fromCharCode(HL7_FRAMING.SEGMENT_SEPARATOR))
        .filter(segment => segment.trim().length > 0)
}

/**
 * Validate HL7 message structure
 */
const isValidMessage = (message) => {
    return message.charCodeAt(0) === MESSAGE_STRUCTURE_AS_STRING.START_BLOCK &&
        message.charCodeAt(message.length - 2) === MESSAGE_STRUCTURE_AS_STRING.FS &&
        message.charCodeAt(message.length - 1) === MESSAGE_STRUCTURE_AS_STRING.SEGMENT_SEPARATOR
}

module.exports = {
    removeMllpFraming,
    unescapeHL7,
    parseMessage,
    isValidMessage
}
