const { cleanObject } = require('../helpers/mappers');
const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');

/**
 * Extracts message acknowledgment information from MSA segment
 * MSA segment contains information sent while acknowledging another message
 */
const extractMessageAcknowledmentInfo = (message) => {
  return cleanObject({
    acknowledgmentCode: getInformationBySegmentTypeAndIndex(message, 'MSA', 1),
    messageControlId: getInformationBySegmentTypeAndIndex(message, 'MSA', 2),
    textMessage: getInformationBySegmentTypeAndIndex(message, 'MSA', 3),
    expectedSequenceNumber: getInformationBySegmentTypeAndIndex(
      message,
      'MSA',
      4
    ),
    delayedAcknowledgmentType: getInformationBySegmentTypeAndIndex(
      message,
      'MSA',
      5
    ),
    errorCondition: getInformationBySegmentTypeAndIndex(message, 'MSA', 6)
  });
};

module.exports = {
  extractMessageAcknowledmentInfo
};
