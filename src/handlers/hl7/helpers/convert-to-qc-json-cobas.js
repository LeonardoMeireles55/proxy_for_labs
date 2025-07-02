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

const log = require('../../../../configs/logger');
const config = require('../../../../configs/config');
const { postQualityControlData } = require('../../../api/send-cq-data');
const { writeDebugFile } = require('../../../shared/save-data-to-file');

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
    const qcLevelResult = inventory

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
 * Groups results by test code and extracts QC parameters for cobas®pure equipment
 *
 * This function processes cobas®pure HL7 results and groups them by test code,
 * extracting the test value, QC_TARGET, and QC_SD_RANGE for each test.
 * It filters out non-test observations like Pipetting_Time and CalibrationID.
 *
 * @function groupResultsByTestCode
 * @param {Object[]} results - Array of laboratory result objects from cobas®pure
 * @param {string} results[].observationName - Test code or parameter name
 * @param {string} results[].value - The result value
 * @param {string} results[].unit - The measurement unit (mg/dL, U/L, mmol/L, etc.)
 * @param {string} results[].observationTimestamp - Timestamp of the observation
 * @returns {Object[]} Array of grouped test results with QC parameters
 *
 * @example
 * const results = [
 *   { observationName: '20340', value: '9.02', unit: 'mg/dL', observationTimestamp: '20250701192446' },
 *   { observationName: 'QC_TARGET', value: '8.78', unit: 'mg/dL' },
 *   { observationName: 'QC_SD_RANGE', value: '0.361', unit: 'mg/dL' }
 * ];
 * const grouped = groupResultsByTestCode(results);
 * // Returns grouped test results with QC parameters
 */
const groupResultsByTestCode = (results) => {
  const testGroups = {};

  // Group results by timestamp to associate QC values with test results
  const resultsByTimestamp = {};

  results.forEach((result) => {
    const timestamp = result.observationTimestamp;
    if (!resultsByTimestamp[timestamp]) {
      resultsByTimestamp[timestamp] = [];
    }
    resultsByTimestamp[timestamp].push(result);
  });

  // Process each timestamp group
  Object.values(resultsByTimestamp).forEach((timestampResults) => {
    // Find the main test result (numeric code like 20340, 20411, etc.)
    const testResult = timestampResults.find(r =>
      /^\d{5}$/.test(r.observationName) &&
      r.unit &&
      !isNaN(parseFloat(r.value)) &&
      !r.value.includes('^')
    );

    if (testResult) {
      const qcTarget = timestampResults.find(r => r.observationName === 'QC_TARGET');
      const qcSdRange = timestampResults.find(r => r.observationName === 'QC_SD_RANGE');

      testGroups[testResult.observationName] = {
        testCode: testResult.observationName,
        value: parseFloat(testResult.value),
        unit: testResult.unit,
        observationTimestamp: testResult.observationTimestamp,
        qcTarget: qcTarget ? parseFloat(qcTarget.value) : null,
        qcSdRange: qcSdRange ? parseFloat(qcSdRange.value) : null
      };
    }
  });

  return Object.values(testGroups);
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
    '20340': 'Total Protein',
    '20411': 'Glucose',
    '20420': 'ALT (Alanine Aminotransferase)',
    '20600': 'AST (Aspartate Aminotransferase)',
    '20710': 'Albumin',
    '20810': 'Alkaline Phosphatase',
    '20990': 'Creatinine',
    '21130': 'Cholesterol',
    '21191': 'Triglycerides',
    '29070': 'Sodium',
    '29080': 'Potassium',
    '29090': 'Chloride',
    // Add more mappings as needed
  };
};


/**
 * Calculates statistical measures using QC_TARGET and QC_SD_RANGE from cobas®pure
 *
 * This function uses the QC target value and standard deviation range provided
 * by the cobas®pure equipment instead of calculating from reference ranges.
 * This provides more accurate QC statistics based on the equipment's calibration.
 *
 * @function calculateStatisticsFromQC
 * @param {number} value - The measured numeric value
 * @param {number} qcTarget - QC target value from the equipment
 * @param {number} qcSdRange - QC standard deviation range from the equipment
 * @returns {Object} Object containing calculated statistics
 *
 * @example
 * const stats = calculateStatisticsFromQC(9.02, 8.78, 0.361);
 * console.log(stats); // { mean: 8.78, sd: 0.361 }
 */
const calculateStatisticsFromQC = (value, qcTarget, qcSdRange) => {
  if (qcTarget !== null && qcSdRange !== null && !isNaN(qcTarget) && !isNaN(qcSdRange)) {
    return { mean: qcTarget, sd: qcSdRange };
  }

  // Fallback to original calculation if QC values are not available
  return { mean: value, sd: value };
};

/**
 * Calculates statistical measures (mean and standard deviation) from a reference range
 *
 * This function takes a numeric value and its reference range to calculate
 * statistical measures for quality control analysis. It parses reference ranges
 * in the format "min-max" and calculates the mean as the midpoint and standard
 * deviation assuming a 3-sigma distribution (99.7% of values within range).
 *
 * @function calculateStatistics
 * @param {number} value - The measured numeric value
 * @param {string} referenceRange - Reference range in format "min-max" (e.g., "70-110")
 * @returns {Object} Object containing calculated statistics
 *
 * @example
 * // With valid reference range
 * const stats = calculateStatistics(95, "70-110");
 * console.log(stats); // { mean: 90, sd: 6.67 }
 *
 * @example
 * // Without reference range
 * const stats = calculateStatistics(95, null);
 * console.log(stats); // { mean: 95, sd: 95 }
 *
 * @example
 * // With invalid reference range
 * const stats = calculateStatistics(95, "invalid-range");
 * console.log(stats); // { mean: 95, sd: 95 }
 */
const calculateStatistics = (value, referenceRange) => {
  if (!referenceRange) return { mean: value, sd: value };

  const rangeParts = referenceRange.split('-');

  if (rangeParts.length === 2) {
    const min = parseFloat(rangeParts[0]);
    const max = parseFloat(rangeParts[1]);

    if (!isNaN(min) && !isNaN(max)) {
      const mean = (min + max) / 2;
      const sd = (max - min) / 6; // Assuming 3 sigma range
      return { mean, sd };
    }
  }

  return { mean: value, sd: value };
};

/**
 * Transforms a single laboratory result into Analytics DTO (Data Transfer Object) format for cobas®pure
 *
 * This function converts an individual HL7 laboratory result into a standardized
 * quality control object suitable for analytics systems. It combines the result
 * data with metadata from the HL7 message and uses QC statistics from the equipment.
 *
 * @function transformResultCobas
 * @param {Object} result - Individual laboratory result object with QC data
 * @param {Object} hl7Data - HL7 message data containing order and patient Information
 * @param {string} qcLevel - Quality control level (low, normal, high)
 *
 * @example
 * const result = {
 *   testCode: '20340',
 *   value: 9.02,
 *   unit: 'mg/dL',
 *   qcTarget: 8.78,
 *   qcSdRange: 0.361,
 *   observationTimestamp: '20250701192446'
 * };
 * const hl7Data = {
 *   order: { observationDateTime: '20250701193219' },
 *   patient: { patientIdentifierList: 'QC_LOT_001' }
 * };
 * const transformed = transformResultCobas(result, hl7Data, 'normal');
 * // Returns quality control object with QC statistics from equipment
 */
const transformResultCobas = (result, hl7Data, qcLevel) => {
  const date = parseHL7Date(result.observationTimestamp || hl7Data.order?.observationDateTime);

    console.log(hl7Data.specimenContainer);

  const { mean, sd } = calculateStatisticsFromQC(result.value, result.qcTarget, result.qcSdRange);

  const qualityControlObject = {
    date,
    // test_lot: '-',
    level_lot: hl7Data.specimenContainer?.carrierIdentifier || 'DEFAULT_LOT',
    name: result.testCode,
    level: hl7Data.inventory?.substanceIdentifier.split('^')[1],
    value: result.value,
    mean,
    sd,
    unit_value: result.unit,
  };

  return qualityControlObject;
};


/**
 * Extracts quality control values from HL7 data and converts to JSON format for cobas®pure

 * @function extractQcValuesAndConvertToJsonCobas
 *
 * @example
 * const hl7Data = {
 *   messageHeader: { messageControlId: 'P' },
 *   results: [
 *     { observationName: '20340', value: '9.02', unit: 'mg/dL', observationTimestamp: '20250701192446' },
 *     { observationName: 'QC_TARGET', value: '8.78', unit: 'mg/dL' },
 *     { observationName: 'QC_SD_RANGE', value: '0.361', unit: 'mg/dL' }
 *   ],
 *   order: { observationDateTime: '20250701193219' },
 *   patient: { patientIdentifierList: 'QC_LOT_001' }
 * };
 *
 * const qcObjects = extractQcValuesAndConvertToJsonCobas(hl7Data);
 * // Returns array of transformed QC objects ready for analytics
 *
 * @throws {Error} Logs error and returns null if conversion fails
 */
const extractQcValuesAndConvertToJsonCobas = (hl7Data) => {
  try {
    if (!hl7Data.results || !Array.isArray(hl7Data.results)) {
      return null;
    }

    // Group results by test code and extract QC parameters
    const groupedResults = groupResultsByTestCode(hl7Data.results);

    if (groupedResults.length === 0) {
      log.warn('No valid test results found for QC conversion');
      return null;
    }

      const qcLevel = extractQcLevel(hl7Data.inventory);

    const qualityControlObject = groupedResults.map((result) =>
      transformResultCobas(result, hl7Data, qcLevel)
    );

    if (config.nodeEnv === 'development') {
      log.debug(
        JSON.stringify(qualityControlObject, null, 2)
      );
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
  groupResultsByTestCode,
  getTestNameMapping
};
