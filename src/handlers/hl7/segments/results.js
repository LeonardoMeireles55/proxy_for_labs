const { mapObxToLabResult } = require('../helpers/HL7-mappers');

/**
 * Extract OBX segments and map to lab results
 */
const extractObxSegments = (parsedMessage) => {
  return Object.values(parsedMessage)
    .filter((segment) => segment.startsWith('OBX'))
    .map(mapObxToLabResult)
    .filter((result) => Object.keys(result).length > 0);
};

module.exports = { extractObxSegments };
