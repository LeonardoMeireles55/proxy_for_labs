const { cleanObject } = require('../helpers/mappers');
const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser');

/**
 * Extracts equipment information from EQU segment
 */
const extractEquipmentInfo = (message) => {
  return cleanObject({
    equipmentInstanceIdentifier: getInformationBySegmentTypeAndIndex(
      message,
      'EQU',
      1
    ),
    eventDateTime: getInformationBySegmentTypeAndIndex(message, 'EQU', 2),
    equipmentState: getInformationBySegmentTypeAndIndex(message, 'EQU', 3),
    localRemoteControlState: getInformationBySegmentTypeAndIndex(
      message,
      'EQU',
      4
    ),
    alertLevel: getInformationBySegmentTypeAndIndex(message, 'EQU', 5)
  });
};

/**
 * Extracts equipment command information from ECD segment (Roche cobas®pure)
 */
const extractEquipmentCommandInfo = (message) => {
  const commandParameterField = getInformationBySegmentTypeAndIndex(
    message,
    'ECD',
    5
  );

  // Parse command parameter field (ECD-5)
  // Format: MaskType~TestCode~ModulType~ModuleSerial~Submodul~ReagentCode~ReagentLot~ReagentSequenceNumber
  let commandParameters = {};

  if (commandParameterField && commandParameterField !== null) {
    const params = commandParameterField.split('~');
    commandParameters = {
      maskType: params[0] || null, // P=Patient, T=Test, R=Reagent
      testCode: params[1] || null, // Test code (ACN)
      moduleType: params[2] || null, // Module type
      moduleSerial: params[3] || null, // Module serial number
      submodule: params[4] || null, // Submodule
      reagentCode: params[5] || null, // Reagent code
      reagentLot: params[6] || null, // Reagent lot
      reagentSequenceNumber: params[7] || null // Reagent sequence number
    };
  }

  return cleanObject({
    referenceCommandNumber: getInformationBySegmentTypeAndIndex(
      message,
      'ECD',
      1
    ),
    instruction: getInformationBySegmentTypeAndIndex(message, 'ECD', 2),
    commandParameter: commandParameterField,
    ...commandParameters
  });
};

module.exports = {
  extractEquipmentInfo,
  extractEquipmentCommandInfo
};
