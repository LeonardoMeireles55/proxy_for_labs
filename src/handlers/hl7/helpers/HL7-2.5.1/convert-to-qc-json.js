/**
 * @fileoverview HL7 Quality Control Data Converter
 *
 * This module provides functionality to convert HL7 laboratory messages into
 * structured quality control JSON objects. It handles date parsing, statistical
 * calculations, and data transformation for quality control analytics.
 *
 * The module specifically processes HL7 messages with message control ID 'Q'
 * which indicates quality control data, extracts numeric test results,
 * calculates statistical measures, and formats the data for external APIs.
 *
 * @author Laboratory System Team
 * @version 1.2.0
 * @since 1.0.0
 */

const log = require('../../../../../configs/logger');
const config = require('../../../../../configs/config');
const {
  postQualityControlData,
  sendToLabSpecAPI
} = require('../../../../api/send-cq-data');
const { writeDebugFile } = require('../../../../shared/save-data-to-file');

/**
 * Parses HL7 date format (YYYYMMDDHHMMSS) to SQL datetime format (YYYY-MM-DD HH:MM:SS)
 *
 * @function parseHL7Date
 * @param {string} hl7DateString - HL7 formatted date string (YYYYMMDDHHMMSS)
 * @returns {string} Formatted date string in SQL datetime format (YYYY-MM-DD HH:MM:SS)
 *
 * @example
 * // Convert HL7 date
 * const sqlDate = parseHL7Date('20231225143000');
 * console.log(sqlDate); // "2023-12-25 14:30:00"
 *
 * @example
 * // Handle incomplete date
 * const sqlDate = parseHL7Date('20231225');
 * console.log(sqlDate); // "2023-12-25 00:00:00"
 *
 * @example
 * // Handle null/undefined input
 * const sqlDate = parseHL7Date(null);
 * console.log(sqlDate); // Current datetime in SQL format
 */
const parseHL7Date = (hl7DateString) => {
  if (!hl7DateString)
    return new Date().toISOString().slice(0, 19).replace('T', ' ');

  const year = hl7DateString.substring(0, 4);
  const month = hl7DateString.substring(4, 6);
  const day = hl7DateString.substring(6, 8);
  const hour = hl7DateString.substring(8, 10) || '00';
  const minute = hl7DateString.substring(10, 12) || '00';
  const second = hl7DateString.substring(12, 14) || '00';

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * Extracts quality control level from HL7 results array
 *
 * Searches through the results array to find the observation with name 'Qc Level'
 * and parses its value to determine the QC level (low, normal, high, or unknown).
 *
 * @function extractQcLevel
 * @param {Object[]} results - Array of HL7 observation results
 * @param {string} results[].observationName - Name of the observation/test
 * @param {string} results[].value - Value of the observation
 * @returns {string} QC level: 'low', 'normal', 'high', or 'unknown'
 *
 * @example
 * const results = [
 *   { observationName: 'Glucose', value: '100' },
 *   { observationName: 'Qc Level', value: 'Level1L' }
 * ];
 * const level = extractQcLevel(results);
 * console.log(level); // "low"
 *
 * @see {@link parseLevel} - Used internally to parse level values
 */
const extractQcLevel = (inventory) => {
  const qcLevelResult = inventory;

  return parseLevel(qcLevelResult) || 'unknown';
};

/**
 * Parses quality control level indicator from a value string
 *
 * Determines the QC level based on the suffix character of the value string.
 * Follows laboratory standards where 'L' indicates low level, 'M' indicates
 * normal/medium level, and 'H' indicates high level.
 *
 * @function parseLevel
 * @param {string|undefined} value - The value string containing level indicator
 * @returns {string|null} Parsed level ('low', 'normal', 'high') or null if not recognized
 *
 * @example
 * parseLevel('Level1L'); // returns 'low'
 * parseLevel('Level2M'); // returns 'normal'
 * parseLevel('Level3H'); // returns 'high'
 * parseLevel('InvalidValue'); // returns null
 * parseLevel(undefined); // returns null
 * parseLevel(123); // returns null (non-string input)
 *
 * @private
 */
const parseLevel = (value) => {
  if (typeof value !== 'string') return null;

  if (value.endsWith('L')) return 'low';
  if (value.endsWith('M')) return 'normal';
  if (value.endsWith('H')) return 'high';

  return null;
};

/**
 * Creates a test code to name mapping for cobas®pure equipment
 * Based on common clinical chemistry and immunoassay parameters
 *
 * @function getTestNameMapping
 * @returns {Object} Mapping of test codes to human-readable names
 */
const getTestNameMapping = () => {
  return {
    20090: 'ALB2',
    20110: 'ALP2S',
    20140: 'ALTL',
    20230: 'ASTL',
    20170: 'AMYL2',
    20300: 'BILD2',
    20310: 'BILT3',
    20340: 'CA2',
    20411: 'CHOL2',
    21130: 'TRIGL',
    21170: 'UA2',
    21191: 'UREAL',
    20420: 'CK2',
    20430: 'CKMB2',
    20470: 'CREJ2',
    20500: 'CRP4',
    20600: 'GGTI2',
    20630: 'GLUC3',
    20710: 'HDLC4',
    29090: 'CL-I',
    29080: 'K-I',
    29070: 'NA-I',
    20990: 'PHOS2',
    20810: 'LDHI2',
    20850: 'LIP',
    20890: 'MG-2'
  };
};


/**
 * Transforms a single laboratory result into Analytics DTO (Data Transfer Object) format for cobas®pure
 *
 * This function converts an individual HL7 laboratory result into a standardized
 * quality control object suitable for analytics systems. It combines the result
 * data with metadata from the HL7 message and uses QC statistics from the equipment.
 *
 * @function transformResultCobas
 * @param {Object} hl7Data - HL7 message data containing order and patient Information
 *
 */
const transformResultCobas = (hl7Data) => {
  let infoValues = 0;
  let infoQCTarget = 4;
  let infoQCSdRange = 5;

  const result = [];
  const length = hl7Data.results.length;

  hl7Data.results.forEach((res) => {
    if (
      infoValues >= length ||
      infoQCTarget >= length ||
      infoQCSdRange >= length
    ) {
      return;
    }

    const cqObject = {
      date: parseHL7Date(
        res.observationTimestamp || hl7Data.order?.observationDateTime
      ),
      test_lot: '-',
      level_lot: hl7Data.specimenContainer?.carrierIdentifier || 'DEFAULT_LOT',
      name: getTestNameMapping()[hl7Data.results[infoValues].observationName],
      level: hl7Data.inventory?.substanceIdentifier.split('^')[1],
      value: hl7Data.results[infoValues].value,
      mean: hl7Data.results[infoQCTarget].value,
      sd: hl7Data.results[infoQCSdRange].value,
      unit_value: hl7Data.results[infoValues].unit,
      equipment: 11
    };

    result.push(cqObject);

    infoValues = infoValues + 6;
    infoQCTarget = infoQCTarget + 6;
    infoQCSdRange = infoQCSdRange + 6;
  });

  return result;
};

/**
 * Extracts quality control values from HL7 data and converts to JSON format for cobas®pure
 * @function extractQcValuesAndConvertToJsonCobas
 * @throws {Error} Logs error and returns null if conversion fails
 */
const extractQcValuesAndConvertToJsonCobas = (hl7Data) => {
  try {
    if (
      hl7Data.specimen?.specimenRole[0] != 'Q' ||
      hl7Data.specimen == undefined
    ) {
      log.warn(
        'HL7 message is not a quality control message, skipping conversion'
      );
      return null;
    }

    if (!hl7Data.results || !Array.isArray(hl7Data.results)) {
      return null;
    }

    const qualityControlObject = transformResultCobas(hl7Data);

    if (config.nodeEnv === 'development') {
      log.debug(JSON.stringify(qualityControlObject, null, 2));
    }

    if (config.nodeEnv === 'production') {
      postQualityControlData(qualityControlObject);
    }

    writeDebugFile(JSON.stringify(qualityControlObject, null, 2));

    return qualityControlObject;
  } catch (error) {
    log.error('Error converting to Qc Json:', error);
    return null;
  }
};

/**
 * Module exports for HL7 Quality Control JSON conversion utilities for cobas®pure
 *
 * @module HL7QCConverterCobas
 * @exports {Function} extractQcValuesAndConvertToJsonCobas - Main conversion function for cobas®pure
 * @exports {Function} parseHL7Date - HL7 date parser utility
 * @exports {Function} extractQcLevel - QC level extraction utility
 * @exports {Function} groupResultsByTestCode - Groups results by test code utility
 * @exports {Function} getTestNameMapping - Test code to name mapping utility
 */
module.exports = {
  extractQcValuesAndConvertToJsonCobas,
  parseHL7Date,
  extractQcLevel,
  getTestNameMapping
};
