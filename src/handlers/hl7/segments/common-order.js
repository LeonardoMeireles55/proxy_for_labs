const { cleanObject } = require('../helpers/mappers');
const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');

/**
 * Extracts common order information from ORC segment
 * ORC segment contains fields common to all orders and is required in Order messages
 */
const extractCommonOrderInfo = (message) => {
  return cleanObject({
    orderControl: getInformationBySegmentTypeAndIndex(message, 'ORC', 1),
    placerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'ORC', 2),
    fillerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'ORC', 3),
    placerGroupNumber: getInformationBySegmentTypeAndIndex(message, 'ORC', 4),
    orderStatus: getInformationBySegmentTypeAndIndex(message, 'ORC', 5),
    responseFlag: getInformationBySegmentTypeAndIndex(message, 'ORC', 6),
    quantityTiming: getInformationBySegmentTypeAndIndex(message, 'ORC', 7),
    parentOrder: getInformationBySegmentTypeAndIndex(message, 'ORC', 8),
    dateTimeOfTransaction: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      9
    ),
    enteredBy: getInformationBySegmentTypeAndIndex(message, 'ORC', 10),
    verifiedBy: getInformationBySegmentTypeAndIndex(message, 'ORC', 11),
    orderingProvider: getInformationBySegmentTypeAndIndex(message, 'ORC', 12),
    enterersLocation: getInformationBySegmentTypeAndIndex(message, 'ORC', 13),
    callBackPhoneNumber: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      14
    ),
    orderEffectiveDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      15
    ),
    orderControlCodeReason: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      16
    ),
    enteringOrganization: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      17
    ),
    enteringDevice: getInformationBySegmentTypeAndIndex(message, 'ORC', 18),
    actionBy: getInformationBySegmentTypeAndIndex(message, 'ORC', 19),
    advancedBeneficiaryNoticeCode: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      20
    ),
    orderingFacilityName: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      21
    ),
    orderingFacilityAddress: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      22
    ),
    orderingFacilityPhoneNumber: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      23
    ),
    orderingProviderAddress: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      24
    ),
    orderStatusModifier: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      25
    ),
    advancedBeneficiaryNoticeOverrideReason:
      getInformationBySegmentTypeAndIndex(message, 'ORC', 26),
    fillersExpectedAvailabilityDateTime: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      27
    ),
    confidentialityCode: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      28
    ),
    orderType: getInformationBySegmentTypeAndIndex(message, 'ORC', 29),
    entererAuthorizationMode: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      30
    ),
    parentUniversalServiceIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'ORC',
      31
    )
  });
};

module.exports = {
  extractCommonOrderInfo
};
