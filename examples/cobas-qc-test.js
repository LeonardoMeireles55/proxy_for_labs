/**
 * @fileoverview Example usage of cobas®pure QC data conversion
 *
 * This example demonstrates how to process quality control data from
 * cobas®pure equipment using the enhanced conversion function.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const { extractQcValuesAndConvertToJsonCobas } = require('../src/handlers/hl7/helpers/convert-to-qc-json-cobas');
const log = require('../configs/logger');

// Sample cobas®pure HL7 data with multiple tests and QC parameters
const cobasQcData = {
    "messageHeader": {
      "fieldSeparator": "^~\\&",
      "encodingCharacters": "cobas pure",
      "sendingFacility": "Host",
      "receivingFacility": "20250701193255+0900",
      "security": "OUL^R22^OUL_R22",
      "messageType": "160",
      "messageControlId": "P",
      "processingId": "2.5.1",
      "continuationPointer": "NE",
      "acceptAcknowledgmentType": "AL",
      "countryCode": "UNICODE UTF-8",
      "alternateCharacterSetHandlingScheme": "LAB-29^IHE"
    },
    "order": {
      "setId": "1",
      "placerOrderNumber": "\"\"",
      "universalServiceIdentifier": "20340^^99ROC"
    },
    "specimen": {
      "setId": "1",
      "specimenId": "20392&CONTROL",
      "specimenType": "\"\"",
      "specimenRole": "Q^^HL70369",
      "specimenDescription": "~~~~",
      "specimenExpirationDateTime": "20260731",
      "specimenCondition": "PSCO^^99ROC",
      "containerType": "SC^^99ROC"
    },
    "inventory": {
      "substanceIdentifier": "20392^PCCC2^99ROC",
      "substanceStatus": "OK^^HL703843",
      "substanceType": "CO^^HL70384",
      "inventoryContainerIdentifier": "^^99ROC"
    },
    "results": [
      {
        "sequenceId": "1",
        "observationName": "20340",
        "value": "13.5",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "2",
        "observationName": "20340",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191546",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "54",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "13.3",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "0.521",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192606"
      },
      {
        "sequenceId": "1",
        "observationName": "20411",
        "value": "169",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "2",
        "observationName": "20411",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191554",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "55",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "169",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "8.51",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192614"
      },
      {
        "sequenceId": "1",
        "observationName": "20420",
        "value": "266",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "2",
        "observationName": "20420",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191602",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "56",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "268",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "16.0",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192622"
      },
      {
        "sequenceId": "1",
        "observationName": "20600",
        "value": "192",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "2",
        "observationName": "20600",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191610",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "57",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "190",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "11.0",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192630"
      },
      {
        "sequenceId": "1",
        "observationName": "20710",
        "value": "57.7",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "2",
        "observationName": "20710",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191618",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "58",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "53.7",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "4.25",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192638"
      },
      {
        "sequenceId": "1",
        "observationName": "20810",
        "value": "308",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "2",
        "observationName": "20810",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191626",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "59",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "305",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "18.0",
        "unit": "U/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192646"
      },
      {
        "sequenceId": "1",
        "observationName": "20990",
        "value": "8.42",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "2",
        "observationName": "20990",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191538",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "60",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "8.49",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "0.434",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192558"
      },
      {
        "sequenceId": "1",
        "observationName": "21130",
        "value": "210",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "2",
        "observationName": "21130",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191634",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "61",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "212",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "10.6",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192654"
      },
      {
        "sequenceId": "1",
        "observationName": "21191",
        "value": "124",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "2",
        "observationName": "21191",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191642",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "62",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "126",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "6.01",
        "unit": "mg/dL",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701192702"
      },
      {
        "sequenceId": "1",
        "observationName": "29070",
        "value": "131.7",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "2",
        "observationName": "29070",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191530",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "13",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "136.0",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "4.0",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "1",
        "observationName": "29080",
        "value": "5.90",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "2",
        "observationName": "29080",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191530",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "14",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "6.11",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "0.18",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "1",
        "observationName": "29090",
        "value": "99.6",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "2",
        "observationName": "29090",
        "value": "^^99ROC",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "3",
        "observationName": "Pipetting_Time",
        "value": "20250701191530",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "4",
        "observationName": "CalibrationID",
        "value": "15",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "5",
        "observationName": "QC_TARGET",
        "value": "103.0",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      },
      {
        "sequenceId": "6",
        "observationName": "QC_SD_RANGE",
        "value": "3.0",
        "unit": "mmol/L",
        "abnormalFlags": "N^^HL70078",
        "observationTimestamp": "20250701191601"
      }
    ]
  };

const parseJson = JSON.parse(JSON.stringify(cobasQcData));


/**
 * Main function to demonstrate QC data processing
 */
const main = () => {
  log.info('=== cobas®pure QC Data Conversion Example ===');

  try {
    // Process the QC data
    const qcResults = extractQcValuesAndConvertToJsonCobas(parseJson);

    if (!qcResults || qcResults.length === 0) {
      log.warn('No QC results were generated');
      return;
    }

    log.info(`Successfully processed ${qcResults.length} QC test results:`);

    // Display results in a formatted way
    qcResults.forEach((result, index) => {
      log.info(`\n--- Test ${index + 1} ---`);
      log.info(`Test Name: ${result.name} (Code: ${result.test_code})`);
      log.info(`Value: ${result.value} ${result.unit_value}`);
      log.info(`QC Target: ${result.qc_target} ${result.unit_value}`);
      log.info(`QC SD Range: ${result.qc_sd_range} ${result.unit_value}`);
      log.info(`Calculated Mean: ${result.mean}`);
      log.info(`Calculated SD: ${result.sd}`);
      log.info(`Date: ${result.date}`);
      log.info(`Level Lot: ${result.level_lot}`);
    });

    // Show summary statistics
    log.info('\n=== Summary ===');
    log.info(`Total tests processed: ${qcResults.length}`);

    const testTypes = [...new Set(qcResults.map(r => r.name))];
    log.info(`Test types: ${testTypes.join(', ')}`);

    const units = [...new Set(qcResults.map(r => r.unit_value))];
    log.info(`Units used: ${units.join(', ')}`);

  } catch (error) {
    log.error('Error processing QC data:', error);
  }
};

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  cobasQcData,
  main
};
