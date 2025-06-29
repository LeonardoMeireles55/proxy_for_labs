const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');
const { cleanObject } = require('../helpers/mappers');

/**
 * Extracts patient information from PID segment
 */
const extractPatientInfo = (message) => {
  return cleanObject({
    setId: getInformationBySegmentTypeAndIndex(message, 'PID', 1),
    patientId: getInformationBySegmentTypeAndIndex(message, 'PID', 2),
    patientIdentifierList: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      3
    ),
    alternatePatientId: getInformationBySegmentTypeAndIndex(message, 'PID', 4),
    patientName: getInformationBySegmentTypeAndIndex(message, 'PID', 5),
    mothersMaidenName: getInformationBySegmentTypeAndIndex(message, 'PID', 6),
    birthDate: getInformationBySegmentTypeAndIndex(message, 'PID', 7),
    administrativeSex: getInformationBySegmentTypeAndIndex(message, 'PID', 8),
    patientAlias: getInformationBySegmentTypeAndIndex(message, 'PID', 9),
    race: getInformationBySegmentTypeAndIndex(message, 'PID', 10),
    patientAddress: getInformationBySegmentTypeAndIndex(message, 'PID', 11),
    countyCode: getInformationBySegmentTypeAndIndex(message, 'PID', 12),
    phoneNumberHome: getInformationBySegmentTypeAndIndex(message, 'PID', 13),
    phoneNumberBusiness: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      14
    ),
    primaryLanguage: getInformationBySegmentTypeAndIndex(message, 'PID', 15),
    maritalStatus: getInformationBySegmentTypeAndIndex(message, 'PID', 16),
    religion: getInformationBySegmentTypeAndIndex(message, 'PID', 17),
    patientAccountNumber: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      18
    ),
    ssnNumber: getInformationBySegmentTypeAndIndex(message, 'PID', 19),
    driversLicenseNumber: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      20
    ),
    mothersIdentifier: getInformationBySegmentTypeAndIndex(message, 'PID', 21),
    ethnicGroup: getInformationBySegmentTypeAndIndex(message, 'PID', 22),
    birthPlace: getInformationBySegmentTypeAndIndex(message, 'PID', 23),
    multipleBirthIndicator: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      24
    ),
    birthOrder: getInformationBySegmentTypeAndIndex(message, 'PID', 25),
    citizenship: getInformationBySegmentTypeAndIndex(message, 'PID', 26),
    veteransMilitaryStatus: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      27
    ),
    nationality: getInformationBySegmentTypeAndIndex(message, 'PID', 28),
    patientDeathDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      29
    ),
    patientDeathIndicator: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      30
    ),
    identityUnknownIndicator: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      31
    ),
    identityReliabilityCode: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      32
    ),
    lastUpdateDateTime: getInformationBySegmentTypeAndIndex(message, 'PID', 33),
    lastUpdateFacility: getInformationBySegmentTypeAndIndex(message, 'PID', 34),
    speciesCode: getInformationBySegmentTypeAndIndex(message, 'PID', 35),
    breedCode: getInformationBySegmentTypeAndIndex(message, 'PID', 36),
    strain: getInformationBySegmentTypeAndIndex(message, 'PID', 37),
    productionClassCode: getInformationBySegmentTypeAndIndex(
      message,
      'PID',
      38
    ),
    tribalCitizenship: getInformationBySegmentTypeAndIndex(message, 'PID', 39)
  });
};

module.exports = { extractPatientInfo };
