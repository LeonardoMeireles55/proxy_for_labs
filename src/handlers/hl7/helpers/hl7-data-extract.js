const log = require('../../../../configs/logger');
const { extractCommonOrderInfo } = require('../segments/common-order')
const {
  extractEquipmentInfo,
  extractEquipmentCommandInfo
} = require('../segments/equipment');
const { extractMessageHeaderInfo } = require('../segments/header');
const { extractInventoryInfo } = require('../segments/inventory');
const { extractMessageAcknowledmentInfo } = require('../segments/message-acknowledgment')
const { extractOrderInfo } = require('../segments/order');
const { extractPatientInfo } = require('../segments/patient');
const { extractObxSegments } = require('../segments/results');
const { extractSpecimenInfo } = require('../segments/specimen');
const { extractSpecimenContainerInfo } = require('../segments/specimen-container-detail')
const { extractSystemClockInfo } = require('../segments/system-clock')
const { extractTestCodeDetailInfo } = require('../segments/test-code-detail')
const { extractTimingQuantityInfo } = require('../segments/time-quantity')
const { extractQcValuesAndConvertToJson } = require('./convert-to-qc-json');
const { extractQcValuesAndConvertToJsonCobas } = require('./convert-to-qc-json-cobas')
const { cleanObject } = require('./mappers');
const { parseRawHL7ToString } = require('./parser');

/**
 * Comprehensive HL7 message extraction
 * @param {Buffer} message - The raw HL7 message buffer
 * @returns {Object} Extracted HL7 data as a structured object
 */
const extractHl7Data = (message) => {
  try {
    const messageHeader = extractMessageHeaderInfo(message);
    const systemClockInfo = extractSystemClockInfo(message);
    const patientInfo = extractPatientInfo(message);
    const acknowledmentInfo = extractMessageAcknowledmentInfo(message);
    const orderInfo = extractOrderInfo(message);
    const commonOrderInfo = extractCommonOrderInfo(message);
    const timingQuatityInfo = extractTimingQuantityInfo(message);
    const specimenInfo = extractSpecimenInfo(message);
    const testCodeDetailInfo = extractTestCodeDetailInfo(message);
    const equipmentInfo = extractEquipmentInfo(message);
    const equipmentCommandInfo = extractEquipmentCommandInfo(message);
    const specimenContainerInfo = extractSpecimenContainerInfo(message);
    const inventoryInfo = extractInventoryInfo(message);
    const labResults = extractObxSegments(parseRawHL7ToString(message));

    const data = cleanObject({
      ...(Object.keys(messageHeader).length && { messageHeader }),
      ...(Object.keys(systemClockInfo).length && { systemClock: systemClockInfo }),
      ...(Object.keys(acknowledmentInfo).length && { acknowledgment: acknowledmentInfo }),
      ...(Object.keys(patientInfo).length && { patient: patientInfo }),
      ...(Object.keys(orderInfo).length && { order: orderInfo }),
      ...(Object.keys(commonOrderInfo).length && { commonOrder: commonOrderInfo }),
      ...(Object.keys(timingQuatityInfo).length && { timingQuantity: timingQuatityInfo }),
      ...(Object.keys(testCodeDetailInfo).length && { testCodeDetail: testCodeDetailInfo }),
      ...(Object.keys(specimenInfo).length && { specimen: specimenInfo }),
      ...(Object.keys(specimenContainerInfo).length && {
        specimenContainer: specimenContainerInfo
      }),
      ...(Object.keys(equipmentInfo).length && { equipment: equipmentInfo }),
      ...(Object.keys(equipmentCommandInfo).length && {
        equipmentCommand: equipmentCommandInfo
      }),
      ...(Object.keys(inventoryInfo).length && { inventory: inventoryInfo }),
      ...(labResults.length && { results: labResults })
    });


    extractQcValuesAndConvertToJsonCobas(data);

    log.debug('Complete HL7 data extracted successfully');

    return data;
  } catch (error) {

    log.error('Error extracting complete HL7 data:', error);

    return {};
  }
};

module.exports = {
  extractHl7Data
};
