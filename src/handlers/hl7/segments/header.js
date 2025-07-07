const {
  getInformationBySegmentTypeAndIndex
} = require('../helpers/hl7-parsers');
const { cleanObject } = require('../helpers/HL7-mappers');

/**
 * Extracts complete message header information from MSH segment
 */
const extractMessageHeaderInfo = (message) => {
  return cleanObject({
    fieldSeparator: getInformationBySegmentTypeAndIndex(message, 'MSH', 1),
    encodingCharacters: getInformationBySegmentTypeAndIndex(message, 'MSH', 2),
    sendingApplication: getInformationBySegmentTypeAndIndex(message, 'MSH', 3),
    sendingFacility: getInformationBySegmentTypeAndIndex(message, 'MSH', 4),
    receivingApplication: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      5
    ),
    receivingFacility: getInformationBySegmentTypeAndIndex(message, 'MSH', 6),
    dateTimeOfMessage: getInformationBySegmentTypeAndIndex(message, 'MSH', 7),
    security: getInformationBySegmentTypeAndIndex(message, 'MSH', 8),
    messageType: getInformationBySegmentTypeAndIndex(message, 'MSH', 9),
    messageControlId: getInformationBySegmentTypeAndIndex(message, 'MSH', 10),
    processingId: getInformationBySegmentTypeAndIndex(message, 'MSH', 11),
    versionId: getInformationBySegmentTypeAndIndex(message, 'MSH', 12),
    sequenceNumber: getInformationBySegmentTypeAndIndex(message, 'MSH', 13),
    continuationPointer: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      14
    ),
    acceptAcknowledgmentType: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      15
    ),
    applicationAcknowledgmentType: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      16
    ),
    countryCode: getInformationBySegmentTypeAndIndex(message, 'MSH', 17),
    characterSet: getInformationBySegmentTypeAndIndex(message, 'MSH', 18),
    principalLanguageOfMessage: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      19
    ),
    alternateCharacterSetHandlingScheme: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      20
    ),
    messageProfileIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'MSH',
      21
    )
  });
};

module.exports = { extractMessageHeaderInfo };
