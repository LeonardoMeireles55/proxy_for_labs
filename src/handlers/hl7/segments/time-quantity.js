const { cleanObject } = require('../helpers/HL7-mappers');
const {
  getInformationBySegmentTypeAndIndex
} = require('../helpers/hl7-parsers');

/**
 * Extracts timing and quantity information from TQ1 segment
 * TQ1 segment specifies complex timing of events and actions for order management
 */
const extractTimingQuantityInfo = (message) => {
  return cleanObject({
    setIdTq1: getInformationBySegmentTypeAndIndex(message, 'TQ1', 1),
    quantity: getInformationBySegmentTypeAndIndex(message, 'TQ1', 2),
    repeatPattern: getInformationBySegmentTypeAndIndex(message, 'TQ1', 3),
    explicitTime: getInformationBySegmentTypeAndIndex(message, 'TQ1', 4),
    relativeTimeAndUnits: getInformationBySegmentTypeAndIndex(
      message,
      'TQ1',
      5
    ),
    serviceDuration: getInformationBySegmentTypeAndIndex(message, 'TQ1', 6),
    startDateTime: getInformationBySegmentTypeAndIndex(message, 'TQ1', 7),
    endDateTime: getInformationBySegmentTypeAndIndex(message, 'TQ1', 8),
    priority: getInformationBySegmentTypeAndIndex(message, 'TQ1', 9),
    conditionText: getInformationBySegmentTypeAndIndex(message, 'TQ1', 10),
    textInstruction: getInformationBySegmentTypeAndIndex(message, 'TQ1', 11),
    conjunction: getInformationBySegmentTypeAndIndex(message, 'TQ1', 12),
    occurrenceDuration: getInformationBySegmentTypeAndIndex(message, 'TQ1', 13),
    totalOccurrences: getInformationBySegmentTypeAndIndex(message, 'TQ1', 14)
  });
};

module.exports = {
  extractTimingQuantityInfo
};
