const { hl7Framing } = require('./buffers')

// HL7 v2.x encoding characters for Cobas Pure C300
const HL7_DELIMITERS = {
    FIELD_SEPARATOR: '|',
    COMPONENT_SEPARATOR: '^',
    REPETITION_SEPARATOR: '~',
    ESCAPE_CHARACTER: '\\',
    SUBCOMPONENT_SEPARATOR: '&'
}

// Escape sequences as per HL7 specification
const ESCAPE_SEQUENCES = {
    '|': '\\F\\',  // Field separator -> \F\
    '^': '\\S\\',  // Component separator -> \S\
    '&': '\\T\\',  // Subcomponent separator -> \T\
    '~': '\\R\\',  // Repetition separator -> \R\
    '\\': '\\E\\'  // Escape character -> \E\
}


const decodeHL7String = (text) => {
    if (!text || typeof text !== 'string') return text

    let decoded = text
    // Decode in reverse order
    Object.entries(ESCAPE_SEQUENCES).reverse().forEach(([char, escape]) => {
        decoded = decoded.replace(new RegExp(escape.replace(/\\/g, '\\\\'), 'g'), char)
    })

    return decoded
}

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

const validateHL7Message = (message) => {
    if (!message) return false

    // Check for proper framing
    const hasStartBlock = message.charCodeAt(0) === hl7Framing.START_BLOCK
    const hasEndBlock = message.includes(String.fromCharCode(hl7Framing.END_BLOCK))

    // Check for MSH segment (required first segment)
    const segments = parseHL7Message(message)
    const hasMSH = segments && segments.length > 0 && segments[0][0] === 'MSH'

    return hasStartBlock && hasEndBlock && hasMSH
}

module.exports = {
    decodeHL7String,
    parseHL7Message,
    validateHL7Message,
    HL7_DELIMITERS,
    ESCAPE_SEQUENCES
}
