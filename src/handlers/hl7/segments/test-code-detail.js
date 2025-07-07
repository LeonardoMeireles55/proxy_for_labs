const { cleanObject } = require('../helpers/HL7-mappers');
const {
  getInformationBySegmentTypeAndIndex
} = require('../helpers/hl7-parsers');

/**
 * Extracts test code detail information from TCD segment
 * TCD segment contains data necessary for laboratory automation operations
 */
const extractTestCodeDetailInfo = (message) => {
  return cleanObject({
    universalServiceIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'TCD',
      1
    ),
    autoDilutionFactor: getInformationBySegmentTypeAndIndex(message, 'TCD', 2),
    rerunDilutionFactor: getInformationBySegmentTypeAndIndex(message, 'TCD', 3),
    preDilutionFactor: getInformationBySegmentTypeAndIndex(message, 'TCD', 4),
    endogenousContentOfPreDilutionDiluent: getInformationBySegmentTypeAndIndex(
      message,
      'TCD',
      5
    ),
    automaticRepeatAllowed: getInformationBySegmentTypeAndIndex(
      message,
      'TCD',
      6
    ),
    reflexAllowed: getInformationBySegmentTypeAndIndex(message, 'TCD', 7),
    analyteRepeatStatus: getInformationBySegmentTypeAndIndex(message, 'TCD', 8)
  });
};

module.exports = {
  extractTestCodeDetailInfo
};
