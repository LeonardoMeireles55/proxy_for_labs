/**
 * Extracts the checksum from an ASTM message
 * The checksum follows the ETB or ETX character as two ASCII hex characters
 * @param {Buffer} data - The message buffer
 * @returns {string|null} - The extracted checksum as a hex string or null if not found
 */
const extractChecksum = (data) => {
    // Look for ETB character (0x17) or ETX character (0x03)
    const etbIndex = Array.from(data).findIndex(function (byte) { return byte === 0x17 })
    const etxIndex = Array.from(data).findIndex(function (byte) { return byte === 0x03 })

    // Use whichever is found (ETB takes precedence)
    const endIndex = etbIndex >= 0 ? etbIndex : etxIndex

    if (endIndex >= 0 && endIndex < data.length - 2) {
      // Extract the checksum (two ASCII characters after ETB/ETX)
      const checksumBytes = data.slice(endIndex + 1, endIndex + 3)
      return checksumBytes.toString('ascii').toUpperCase()
    }

    return null
  }

  /**
   * Calculates the checksum for an ASTM message
   * The checksum is calculated by summing all bytes from STX+1 up to and INCLUDING ETX/ETB
   * then taking the result modulo 256 and converting to a 2-character hex string
   * @param {Buffer} data - The message buffer
   * @returns {string} - The calculated checksum as a hex string
   */
  const calculateChecksum = (data) => {
    // Find STX (0x02) and ETX (0x03) or ETB (0x17) positions
    const stxIndex = Array.from(data).findIndex(function (byte) { return byte === 0x02 })
    const etxIndex = Array.from(data).findIndex(function (byte) { return byte === 0x03 })
    const etbIndex = Array.from(data).findIndex(function (byte) { return byte === 0x17 })

    // Determine start and end positions for checksum calculation
    const startIndex = stxIndex >= 0 ? stxIndex + 1 : 0 // Skip STX if present
    let endIndex = data.length

    if (etbIndex >= 0) {
      endIndex = etbIndex + 1 // Up to and INCLUDING ETB
    } else if (etxIndex >= 0) {
      endIndex = etxIndex + 1 // Up to and INCLUDING ETX
    }

    // Calculate checksum by summing bytes in range
    let sum = 0
    for (let i = startIndex;i < endIndex;i++) {
      sum += data[i]
    }

    // Format as 2-character hex (modulo 256)
    return (sum % 256).toString(16).toUpperCase().padStart(2, '0')
  }

  module.exports = {
    extractChecksum: extractChecksum,
    calculateChecksum: calculateChecksum
  }
