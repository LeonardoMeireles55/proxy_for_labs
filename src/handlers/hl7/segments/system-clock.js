const { cleanObject } = require('../helpers/mappers');
const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');
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
