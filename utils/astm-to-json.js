const log = require('./logger')
const { astmFraming } = require('./buffers')

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
