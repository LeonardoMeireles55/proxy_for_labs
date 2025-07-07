const { cleanObject } = require('../helpers/HL7-mappers');
const {
  getInformationBySegmentTypeAndIndex
} = require('../helpers/hl7-parsers');
/**
 * Extracts system clock information from NCK segment
 * NCK segment contains system date and time information
 */

const extractSystemClockInfo = (message) => {
  return cleanObject({
    systemDateTime: getInformationBySegmentTypeAndIndex(message, 'NCK', 1)
  });
};

module.exports = {
  extractSystemClockInfo
};
