const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');
const { cleanObject } = require('../helpers/mappers');

/**
 * Extracts inventory detail information from INV segment
 */
const extractInventoryInfo = (message) => {
  return cleanObject({
    substanceIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 1),
    substanceStatus: getInformationBySegmentTypeAndIndex(message, 'INV', 2),
    substanceType: getInformationBySegmentTypeAndIndex(message, 'INV', 3),
    inventoryContainerIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      4
    ),
    containerCarrierIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      5
    ),
    positionOnCarrier: getInformationBySegmentTypeAndIndex(message, 'INV', 6),
    initialQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 7),
    currentQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 8),
    availableQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 9),
    consumptionQuantity: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      10
    ),
    quantityUnits: getInformationBySegmentTypeAndIndex(message, 'INV', 11),
    expirationDateTime: getInformationBySegmentTypeAndIndex(message, 'INV', 12),
    firstUsedDateTime: getInformationBySegmentTypeAndIndex(message, 'INV', 13),
    onBoardStabilityDuration: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      14
    ),
    testFluidIdentifiers: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      15
    ),
    manufacturerLotNumber: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      16
    ),
    manufacturerIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      17
    ),
    supplierIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 18),
    onBoardStabilityTime: getInformationBySegmentTypeAndIndex(
      message,
      'INV',
      19
    ),
    targetValue: getInformationBySegmentTypeAndIndex(message, 'INV', 20)
  });
};

module.exports = { extractInventoryInfo };
