const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');
const { cleanObject } = require('../helpers/mappers');

/**
 * Extracts complete order information from OBR segment
 */
const extractOrderInfo = (message) => {
  return cleanObject({
    setId: getInformationBySegmentTypeAndIndex(message, 'OBR', 1),
    placerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 2),
    fillerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 3),
    universalServiceIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      4
    ),
    priority: getInformationBySegmentTypeAndIndex(message, 'OBR', 5),
    requestDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 6),
    observationDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 7),
    observationEndDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      8
    ),
    collectionVolume: getInformationBySegmentTypeAndIndex(message, 'OBR', 9),
    collectorIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      10
    ),
    specimenActionCode: getInformationBySegmentTypeAndIndex(message, 'OBR', 11),
    dangerCode: getInformationBySegmentTypeAndIndex(message, 'OBR', 12),
    relevantClinicalInfo: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      13
    ),
    specimenReceivedDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      14
    ),
    specimenSource: getInformationBySegmentTypeAndIndex(message, 'OBR', 15),
    orderingProvider: getInformationBySegmentTypeAndIndex(message, 'OBR', 16),
    orderCallbackPhone: getInformationBySegmentTypeAndIndex(message, 'OBR', 17),
    placerField1: getInformationBySegmentTypeAndIndex(message, 'OBR', 18),
    placerField2: getInformationBySegmentTypeAndIndex(message, 'OBR', 19),
    fillerField1: getInformationBySegmentTypeAndIndex(message, 'OBR', 20),
    fillerField2: getInformationBySegmentTypeAndIndex(message, 'OBR', 21),
    resultsReportStatusChangeDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      22
    ),
    chargeToPractice: getInformationBySegmentTypeAndIndex(message, 'OBR', 23),
    diagnosticServiceSectionId: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      24
    ),
    resultStatus: getInformationBySegmentTypeAndIndex(message, 'OBR', 25),
    parentResult: getInformationBySegmentTypeAndIndex(message, 'OBR', 26),
    quantityTiming: getInformationBySegmentTypeAndIndex(message, 'OBR', 27),
    resultCopiesTo: getInformationBySegmentTypeAndIndex(message, 'OBR', 28),
    parentNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 29),
    transportationMode: getInformationBySegmentTypeAndIndex(message, 'OBR', 30),
    reasonForStudy: getInformationBySegmentTypeAndIndex(message, 'OBR', 31),
    principalResultInterpreter: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      32
    ),
    assistantResultInterpreter: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      33
    ),
    technician: getInformationBySegmentTypeAndIndex(message, 'OBR', 34),
    transcriptionist: getInformationBySegmentTypeAndIndex(message, 'OBR', 35),
    scheduledDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 36),
    numberOfSampleContainers: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      37
    ),
    transportLogistics: getInformationBySegmentTypeAndIndex(message, 'OBR', 38),
    collectorComment: getInformationBySegmentTypeAndIndex(message, 'OBR', 39),
    transportArrangementResponsibility: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      40
    ),
    transportArranged: getInformationBySegmentTypeAndIndex(message, 'OBR', 41),
    escortRequired: getInformationBySegmentTypeAndIndex(message, 'OBR', 42),
    plannedPatientTransportComment: getInformationBySegmentTypeAndIndex(
      message,
      'OBR',
      43
    )
  });
};

module.exports = { extractOrderInfo };
