const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');
const { cleanObject } = require('../helpers/mappers');

/**
 * Extracts specimen container detail information from SAC segment
 * Based on HL7 v2.5.1 specification for SAC - Specimen Container detail
 */
const extractSpecimenContainerInfo = (message) => {
  return cleanObject({
    externalAccessionIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 1),
    accessionIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 2),
    containerIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 3),
    primaryContainerIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 4),
    equipmentContainerIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 5),
    specimenSource: getInformationBySegmentTypeAndIndex(message, 'SAC', 6),
    registrationDateTime: getInformationBySegmentTypeAndIndex(message, 'SAC', 7),
    containerStatus: getInformationBySegmentTypeAndIndex(message, 'SAC', 8),
    carrierType: getInformationBySegmentTypeAndIndex(message, 'SAC', 9),
    carrierIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 10),
    positionInCarrier: getInformationBySegmentTypeAndIndex(message, 'SAC', 11),
    trayType: getInformationBySegmentTypeAndIndex(message, 'SAC', 12),
    trayIdentifier: getInformationBySegmentTypeAndIndex(message, 'SAC', 13),
    positionInTray: getInformationBySegmentTypeAndIndex(message, 'SAC', 14),
    location: getInformationBySegmentTypeAndIndex(message, 'SAC', 15),
    containerHeight: getInformationBySegmentTypeAndIndex(message, 'SAC', 16),
    containerDiameter: getInformationBySegmentTypeAndIndex(message, 'SAC', 17),
    barrierDelta: getInformationBySegmentTypeAndIndex(message, 'SAC', 18),
    bottomDelta: getInformationBySegmentTypeAndIndex(message, 'SAC', 19),
    containerDimensionUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 20),
    containerVolume: getInformationBySegmentTypeAndIndex(message, 'SAC', 21),
    availableSpecimenVolume: getInformationBySegmentTypeAndIndex(message, 'SAC', 22),
    initialSpecimenVolume: getInformationBySegmentTypeAndIndex(message, 'SAC', 23),
    volumeUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 24),
    separatorType: getInformationBySegmentTypeAndIndex(message, 'SAC', 25),
    capType: getInformationBySegmentTypeAndIndex(message, 'SAC', 26),
    additive: getInformationBySegmentTypeAndIndex(message, 'SAC', 27),
    specimenComponent: getInformationBySegmentTypeAndIndex(message, 'SAC', 28),
    dilutionFactor: getInformationBySegmentTypeAndIndex(message, 'SAC', 29),
    treatment: getInformationBySegmentTypeAndIndex(message, 'SAC', 30),
    temperature: getInformationBySegmentTypeAndIndex(message, 'SAC', 31),
    hemolysisIndex: getInformationBySegmentTypeAndIndex(message, 'SAC', 32),
    hemolysisIndexUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 33),
    lipemiaIndex: getInformationBySegmentTypeAndIndex(message, 'SAC', 34),
    lipemiaIndexUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 35),
    icterusIndex: getInformationBySegmentTypeAndIndex(message, 'SAC', 36),
    icterusIndexUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 37),
    fibrinIndex: getInformationBySegmentTypeAndIndex(message, 'SAC', 38),
    fibrinIndexUnits: getInformationBySegmentTypeAndIndex(message, 'SAC', 39),
    systemInducedContaminants: getInformationBySegmentTypeAndIndex(message, 'SAC', 40),
    drugInterference: getInformationBySegmentTypeAndIndex(message, 'SAC', 41),
    artificialBlood: getInformationBySegmentTypeAndIndex(message, 'SAC', 42),
    specialHandlingCode: getInformationBySegmentTypeAndIndex(message, 'SAC', 43),
    otherEnvironmentalFactors: getInformationBySegmentTypeAndIndex(message, 'SAC', 44)
  });
};

module.exports = { extractSpecimenContainerInfo };
