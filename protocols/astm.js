const log = require('../utils/logger')
const { ASTM } = require('../proxy/utils')

// Simple ASTM message parser
const parseAstmMessage = (buffer) => {
  const hexString = Array.from(buffer)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')

  // Check for control characters
  const controlMessages = {
    [ASTM.ENQ]: 'ENQ (Enquiry - Start Communication)',
    [ASTM.ACK]: 'ACK (Acknowledge - Positive Response)',
    [ASTM.NAK]: 'NAK (Negative Acknowledge - Error)',
    [ASTM.EOT]: 'EOT (End of Transmission)',
    [ASTM.STX]: 'STX (Start of Text)',
    [ASTM.ETX]: 'ETX (End of Text)',
    [ASTM.CR]: 'CR (Carriage Return)'
  }

  // Single control character messages
  if (buffer.length === 1 && controlMessages[buffer[0]]) {
    return {
      type: 'control',
      message: controlMessages[buffer[0]],
      raw: buffer,
      hex: hexString
    }
  }

  // Data messages (with STX/ETX framing)
  const dataString = buffer.toString('latin1')
  let cleanData = dataString

  // Remove framing if present
  if (cleanData.charCodeAt(0) === ASTM.STX) {
    cleanData = cleanData.substring(1)
  }
  if (cleanData.charCodeAt(cleanData.length - 1) === ASTM.ETX) {
    cleanData = cleanData.substring(0, cleanData.length - 1)
  }

  // Parse pipe-delimited segments
  const segments = []
  if (cleanData.includes('|')) {
    const parts = cleanData.split('|')
    segments.push({
      recordType: parts[0] || '',
      sequenceNumber: parts[1] || '',
      fields: parts.slice(2)
    })
  }

  return {
    type: segments.length > 0 ? 'data' : 'raw',
    segments,
    raw: buffer,
    hex: hexString,
    text: dataString
  }
}

// Create sample ASTM messages for testing
const createSampleMessages = () => ({
  ENQ: Buffer.from([ASTM.ENQ]),
  ACK: Buffer.from([ASTM.ACK]),
  NAK: Buffer.from([ASTM.NAK]),
  EOT: Buffer.from([ASTM.EOT]),

  // Sample data records
  header: `${String.fromCharCode(ASTM.STX)}H|\\^&|||LIS^Host^1.0.0||||||P|LIS02-A2|${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}${String.fromCharCode(ASTM.ETX)}`,
  patient: `${String.fromCharCode(ASTM.STX)}P|1||12345||DOE^JOHN||19800101|M|||||||||||||||||||${String.fromCharCode(ASTM.ETX)}`,
  order: `${String.fromCharCode(ASTM.STX)}O|1|12345||^^^GLU|||${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}||||||||||||||||||F${String.fromCharCode(ASTM.ETX)}`,
  result: `${String.fromCharCode(ASTM.STX)}R|1|^^^GLU|120|mg/dL||N||F||||${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}${String.fromCharCode(ASTM.ETX)}`
})

module.exports = {
  parseAstmMessage,
  createSampleMessages,
  ASTM
}
