/**
 * Parses HL7 date format (YYYYMMDDHHMMSS) to datetime format (YYYY-MM-DD HH:MM:SS)
 *
 * @function formatHL7RawDate
 * @param {string} hl7DateString - HL7 formatted date string (YYYYMMDDHHMMSS)
 * @returns {string} Formatted date string in datetime format (YYYY-MM-DD HH:MM:SS)
 */
const formatHL7RawDate = (hl7DateString) => {
    if (!hl7DateString)
        return new Date().toISOString().slice(0, 19).replace('T', ' ')

    const year = hl7DateString.substring(0, 4)
    const month = hl7DateString.substring(4, 6)
    const day = hl7DateString.substring(6, 8)
    const hour = hl7DateString.substring(8, 10) || '00'
    const minute = hl7DateString.substring(10, 12) || '00'
    const second = hl7DateString.substring(12, 14) || '00'

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  };

  module.exports = {
    formatHL7RawDate
  };
