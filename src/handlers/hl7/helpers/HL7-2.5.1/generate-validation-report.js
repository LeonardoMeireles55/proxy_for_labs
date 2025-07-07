const log = require('../../../../../configs/logger');
const config = require('../../../../../configs/config');

const { sendToLabSpecAPI } = require('../../../../api/send-cq-data');
const { writeDebugFile } = require('../../../../shared/save-data-to-file');
const { getTestNameMapping, parseHL7Date } = require('./convert-to-qc-json')

const generateValidationReport = (hl7Data) => {
  if (!config.isForValidation) {
    return;
  }

  try {
    if (!hl7Data.results || !Array.isArray(hl7Data.results)) {
      return null;
    }

    const IdCode = hl7Data.specimen.specimenId.split('&')[0];

    log.info(`Generating validation report for patient ID: ${IdCode}`);

    const validationReport = hl7Data.results
      .filter((result) => {
        const testNameMapping = getTestNameMapping();
        return (
          testNameMapping[result.observationName] &&
          result.unit &&
          !isNaN(parseFloat(result.value)) &&
          !result.value.includes('^')
        );
      })
      .map((result) => {
        const testNameMapping = getTestNameMapping();
        const name = testNameMapping[result.observationName];

        return {
          date: parseHL7Date(result.observationTimestamp),
          level_lot: '04142024',
          name,
          value: result.value,
          level: 'PCCC1',
          unit_value: result.unit,
          equipment: 12
        };
      });

    if (config.nodeEnv === 'development') {
      writeDebugFile('validation-report-cobas.json', validationReport);
    }

    if (config.nodeEnv === 'production') {
      log.info('Sending validation report to lab-spec.systems');
      sendToLabSpecAPI(validationReport);
    }

    return validationReport;
  } catch (error) {
    log.error('Error generating validation report:', error);
    return null;
  }
};

module.exports = { generateValidationReport };
