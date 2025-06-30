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
const extractQcLevel = (results) => {
  const qcLevelResult = results.find((r) => r.observationName == 'Qc Level');

  return parseLevel(qcLevelResult?.value) || 'unknown';
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
 * Filters laboratory results to include only numeric values with measurement units
 *
 * This function processes an array of laboratory results and returns only those
 * that contain valid numeric values, have measurement units, and have observation names.
 * This filtering is essential for quality control analytics as only quantitative
 * results with units can be used for statistical analysis.
 *
 * @function filterNumericResults
 * @param {Object[]} results - Array of laboratory result objects
 * @param {string} results[].value - The result value (should be numeric)
 * @param {string} results[].unit - The measurement unit (mg/dL, mmol/L, etc.)
 * @param {string} results[].observationName - Name of the test/observation
 * @returns {Object[]} Filtered array containing only numeric results with units
 *
 * @example
 * const results = [
 *   { observationName: 'Glucose', value: '120', unit: 'mg/dL' },
 *   { observationName: 'Comment', value: 'Normal', unit: '' },
 *   { observationName: 'Cholesterol', value: '200', unit: 'mg/dL' }
 * ];
 * const filtered = filterNumericResults(results);
 * // Returns: [
 * //   { observationName: 'Glucose', value: '120', unit: 'mg/dL' },
 * //   { observationName: 'Cholesterol', value: '200', unit: 'mg/dL' }
 * // ]
 */
const filterNumericResults = (results) => {
  return results.filter((result) => {
    const value = parseFloat(result.value);
    return !isNaN(value) && result.unit && result.observationName;
  });
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
 * Transforms a single laboratory result into Analytics DTO (Data Transfer Object) format
 *
 * This function converts an individual HL7 laboratory result into a standardized
 * quality control object suitable for analytics systems. It combines the result
 * data with metadata from the HL7 message and calculates statistical measures.
 *
 * @function transformResult
 * @param {Object} result - Individual laboratory result object
 * @param {Object} hl7Data - HL7 message data containing order and patient Information
 * @param {string} qcLevel - Quality control level (low, normal, high)
 *
 * @example
 * const result = {
 *   value: '95',
 *   observationName: 'Glucose',
 *   unit: 'mg/dL',
 *   referenceRange: '70-110'
 * };
 * const hl7Data = {
 *   order: { observationDateTime: '20231225143000' },
 *   patient: { patientIdentifierList: 'QC_LOT_001' }
 * };
 * const transformed = transformResult(result, hl7Data, 'normal');
 * // Returns quality control object with calculated statistics
 */
const transformResult = (result, hl7Data, qcLevel) => {
  const date = parseHL7Date(hl7Data.order?.observationDateTime);

  const value = parseFloat(result.value);

  const { mean, sd } = calculateStatistics(value, result.referenceRange);

  const qualityControlObject = {
    date,
    test_lot: '-',
    level_lot: hl7Data.patient?.patientIdentifierList || 'DEFAULT_LOT',
    name: result.observationName,
    level: qcLevel,
    value,
    mean,
    sd,
    unit_value: result.unit
  };

  return qualityControlObject;
};

/**
 * Extracts quality control values from HL7 data and converts to JSON format

 * @function extractQcValuesAndConvertToJson
 *
 * @example
 * const hl7Data = {
 *   messageHeader: { messageControlId: 'Q' },
 *   results: [
 *     { observationName: 'Glucose', value: '95', unit: 'mg/dL', referenceRange: '70-110' },
 *     { observationName: 'Qc Level', value: 'Level1M' }
 *   ],
 *   order: { observationDateTime: '20231225143000' },
 *   patient: { patientIdentifierList: 'QC_LOT_001' }
 * };
 *
 * const qcObjects = extractQcValuesAndConvertToJson(hl7Data);
 * // Returns array of transformed QC objects ready for analytics
 *
 * @throws {Error} Logs error and returns null if conversion fails
 */
const extractQcValuesAndConvertToJson = (hl7Data) => {

  if (hl7Data.messageHeader.messageControlId !== 'Q') {
    log.warn('Is not a control quality message, skipping conversion');
    return null;
  }

  try {
    if (!hl7Data.results || !Array.isArray(hl7Data.results)) {
      return null;
    }

    const qcLevel = extractQcLevel(hl7Data.results);

    const numericResults = filterNumericResults(hl7Data.results);

    const qualityControlObject = numericResults.map((result) =>
      transformResult(result, hl7Data, qcLevel)
    );

    if (config.nodeEnv === 'development') {
      log.debug(
        'Quality Control Object:',
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
 * Module exports for HL7 Quality Control JSON conversion utilities
 *
 * @module HL7QCConverter
 * @exports {Function} extractQcValuesAndConvertToJson - Main conversion function
 * @exports {Function} parseHL7Date - HL7 date parser utility
 * @exports {Function} extractQcLevel - QC level extraction utility
 */
module.exports = {
  extractQcValuesAndConvertToJson,
  parseHL7Date,
  extractQcLevel
};
