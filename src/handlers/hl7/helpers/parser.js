const log = require('../../../../configs/logger');
const { HL7_FRAMING, MLLP_START, MLLP_END } = require('../../utils/buffers');

/**
 * @fileoverview Core utilities for HL7 message processing and parsing.
 *
 * This module provides essential functions for handling HL7 (Health Level 7) messages,
 * including MLLP (Minimal Lower Layer Protocol) framing operations, message validation,
 * character unescaping, and message parsing into segments.
 *
 * @author Lab Proxy System
 * @version 1.0.0
 */

/**
 * Remove MLLP (Minimal Lower Layer Protocol) framing characters from HL7 message.
 * Removes the start block character and end block characters to extract the pure HL7 message content.
 *
 * @param {Buffer} rawMessage - The raw HL7 message buffer with MLLP framing
 * @returns {Buffer} The cleaned HL7 message
 * @example
 * // Returns cleaned HL7 message string
 * const cleaned = removeMllpFraming(buffer);
 */
const removeMllpFraming = (rawMessage) => {
  if (!isValidHL7Message(rawMessage)) {
    return Buffer.from('');
  }

  const cleaned =
    rawMessage[0] === HL7_FRAMING.START_BLOCK[0]
      ? rawMessage.subarray(1)
      : rawMessage;

  const cleanMessage = cleaned
    .subarray(0, -HL7_FRAMING.END_BLOCK.length)

  return cleanMessage;
};

const escapeHL7 = (text) => {
  if (!text) return '';
  return text
    .replaceAll('|', '\\F\\')
    .replaceAll('^', '\\S\\')
    .replaceAll('&', '\\T\\')
    .replaceAll('~', '\\R\\')
    .replaceAll('\\', '\\E\\');
}

/**
 * Unescape HL7 special characters according to HL7 encoding rules.
 * Converts HL7 escape sequences back to their original characters:
 * - \F\ → | (field separator)
 * - \S\ → ^ (component separator)
 * - \T\ → & (subcomponent separator)
 * - \R\ → ~ (repetition separator)
 * - \E\ → \ (escape character)
 *
 * @param {string} text - The HL7 text containing escape sequences
 * @returns {string} The unescaped text with original characters restored
 * @example
 * // Returns "MSH|^~\&|"
 * const unescaped = unescapeHL7("MSH\\F\\\\S\\\\R\\\\T\\\\E\\");
 */
const unescapeHL7 = (text) => {
  if (!text) return '';

  return text
    .replaceAll(/\\F\\/g, '|')
    .replaceAll(/\\S\\/g, '^')
    .replaceAll(/\\T\\/g, '&')
    .replaceAll(/\\R\\/g, '~')
    .replaceAll(/\\E\\/g, '\\');
};

/**
 * Format HL7 text by replacing line breaks
 * @param {string} text - The raw HL7 string with line breaks
 * @returns {string} The formatted HL7 string with line breaks replaced by carriage returns
 */
const formatHL7LineBreaks = (text) => {
  if (!text) return '';

  const newtext = text.replaceAll(',', '').replaceAll(/["\\]/g, "").replaceAll(/\\"{2}/g, '')

  return unescapeHL7(newtext).replaceAll('\n', HL7_FRAMING.SEGMENT_SEPARATOR.toString('utf8'))
};

const parseRawStringToHL7Buffer = (/** @type {string} */ rawMessage) => {

  rawMessage = formatHL7LineBreaks(rawMessage);

  return Buffer.from(MLLP_START + rawMessage + MLLP_END, 'utf-8');
};

/**
 * Parse raw HL7 message into individual segments.
 * Removes MLLP framing and splits the message by segment separators (carriage return).
 * Filters out empty segments to ensure clean parsing.
 *
 * @param {Buffer} rawMessage - The raw HL7 message buffer with MLLP framing
 * @returns {string[]} Array of HL7 segments (MSH, PID, OBR, etc.)
 * @example
 * // Returns ["MSH|^~\&|...", "PID|1||...", "OBR|1|..."]
 * const segments = parseRawHL7ToString(buffer);
 */
const parseRawHL7ToString = (rawMessage) => {

  rawMessage = Buffer.from(unescapeHL7(rawMessage.toString('utf8')), 'utf8');


  return removeMllpFraming(rawMessage).toString('utf8')
    .split(String.fromCharCode(HL7_FRAMING.SEGMENT_SEPARATOR[0]))
    .filter((segment) => segment.trim().length > 0);
};

/**
 * Validate HL7 message structure by checking MLLP framing.
 * Ensures the message has proper start block (0x0B) and end block (0x1C + 0x0D) characters
 * according to the MLLP (Minimal Lower Layer Protocol) specification.
 *
 * @param {Buffer} rawMessage - The raw message buffer to validate
 * @returns {boolean} True if the message has valid MLLP framing, false otherwise
 * @example
 * // Returns true for properly framed HL7 message
 * const isValid = isValidMessage(buffer);
 */
const isValidHL7Message = (rawMessage) => {
  const hasStartBlock = rawMessage[0] === HL7_FRAMING.START_BLOCK[0];

  // Get last 2 bytes to compare with END_BLOCK
  const endBytes = rawMessage.subarray(-2);
  const hasEndBlock = Buffer.compare(endBytes, HL7_FRAMING.END_BLOCK) === 0;

  return hasStartBlock && hasEndBlock;
};

/**
 * Convert HL7 message to JSON structure
 * @param {Buffer} rawMessage - The raw HL7 message buffer
 * @returns {Object} JSON representation of the HL7 message, with segments as keys
 */
const HL7toJson = (rawMessage) => {

  const segments = parseRawHL7ToString(rawMessage);
  const json = {};

  segments.forEach((segment) => {
    const fields = segment.split('|');
    const segmentType = fields[0];

    if (!json[segmentType]) {
      json[segmentType] = [];
    }

    json[segmentType].push(segment.substring(segmentType.length));
  });

  return json;
};


/**
 * Convert HL7 message to JSON structure working directly with Buffer
 * @param {Buffer} rawMessage - The raw HL7 message buffer
 * @returns {Object} JSON representation of the HL7 message, with segments as keys
 */
const HL7BufferToJson = (rawMessage) => {

  if (!isValidHL7Message(rawMessage)) {
    return {}
  }

  // Remove MLLP framing without string conversion
  const cleaned = rawMessage[0] === HL7_FRAMING.START_BLOCK[0]
    ? rawMessage.subarray(1, -HL7_FRAMING.END_BLOCK.length)
    : rawMessage.subarray(0, -HL7_FRAMING.END_BLOCK.length)

  const json = {}

  const segmentSeparator = HL7_FRAMING.SEGMENT_SEPARATOR[0] // 0x0D (carriage return)

  const fieldSeparator = HL7_FRAMING.FIELD_SEPARATOR[0] // '|' character

  let segmentStart = 0

  for (let i = 0;i <= cleaned.length;i++) {
    // Process segment when we hit separator or end of buffer
    if (i === cleaned.length || cleaned[i] === segmentSeparator) {
      if (i > segmentStart) {
        const segmentBuffer = cleaned.subarray(segmentStart, i)

        // Find first field separator to get segment type
        const firstPipeIndex = segmentBuffer.indexOf(fieldSeparator)

        if (firstPipeIndex > 0) {
          const segmentType = segmentBuffer.subarray(0, firstPipeIndex).toString('utf8')
          const segmentData = segmentBuffer.subarray(firstPipeIndex).toString('utf8')

          if (!json[segmentType]) {
            json[segmentType] = []
          }

          json[segmentType].push(segmentData)
        }
      }
      segmentStart = i + 1
    }
  }

  return json
};



/**
 * Get specific segment data by type
 * @param {Buffer} rawMessage - The raw HL7 message buffer
 * @param {string} segmentType - The type of HL7 segment to retrieve (e.g., 'PID', 'OBR')
 * @returns {string|null} The segment data as a string, or null if not found
 */
const getSegmentData = (rawMessage, segmentType) => {

  const jsonData = HL7BufferToJson(rawMessage);

  return jsonData[segmentType]?.[0] || null;
};

/**
 * Get field value by segment type and field index
 * @param {Buffer} message - The HL7 message buffer
 * @param {string} segmentType - The type of HL7 segment (e.g., 'PID', 'OBR')
 * @param {number} fieldIndex - The index of the field within the segment(0-based)
 * @returns {string|null} The value of the specified field, or null if not found
 */
const getInformationBySegmentTypeAndIndex = (
  message,
  segmentType,
  fieldIndex
) => {
  const segmentData = getSegmentData(message, segmentType);
  if (!segmentData) return null;

  const fields = segmentData.split('|');
  return fields[fieldIndex] || null;
};

/**
 * Get value from HL7 message by segment type, field, component, and subcomponent indices
 * @param {Buffer} message - The HL7 message buffer
 * @param {string} segmentType - The type of HL7 segment (e.g., 'PID', 'OBR')
 * @param {number} fieldIndex - The index of the field within the segment (0-based)
 * @param {number|null} componentIndex - The index of the component within the field (0-based, or null for whole field)
 * @param {number|null} subcomponentIndex - The index of the subcomponent within the component (0-based, or null for whole component)
 * @returns {string|null} The value of the specified field/component/subcomponent, or null if not found
 */
const getHL7ValueBySegmentTypeFieldComponentAndSubcomponent = (
  message,
  segmentType,
  fieldIndex,
  componentIndex,
  subcomponentIndex
) => {

  const field = getInformationBySegmentTypeAndIndex(
    message,
    segmentType,
    fieldIndex);

  if (!field) return null

  if (componentIndex === null) return field

  const components = field.split('^')

  const component = components[componentIndex]

  if (!component) return null

  if (subcomponentIndex === null) return component

  const subcomponents = component.split('&')
  return subcomponents[subcomponentIndex] || null
};



/**
 * Parse MSH segment for control information
 * @param {Buffer|string} cleanMessage - The HL7 message buffer or string to parse
 * @returns {Object} An object containing messageControlId and triggerEvent
 */
const parseMshSegment = (cleanMessage) => {

  if (!cleanMessage || cleanMessage.length === 0) {
    log.warn('Empty or invalid HL7 message provided for MSH parsing');
    return '';
  }

  if(Buffer.isBuffer(cleanMessage)) {
    cleanMessage = cleanMessage.toString('utf8');
  }

  const mshSegment = cleanMessage.split('\r')[0];
  const mshFields = mshSegment.split('|');

  const messageControlId = mshFields[9] || 'DEFAULT';
  const msh9 = mshFields[8] || 'ORU^R01^ORU_R01';
  const triggerEvent = msh9.split('^')[1] || 'R01';

  return { messageControlId, triggerEvent };
};

module.exports = {
  HL7toJson,
  HL7BufferToJson,
  getSegmentData,
  getInformationBySegmentTypeAndIndex,
  getHL7ValueBySegmentTypeFieldComponentAndSubcomponent,
  parseMshSegment,
  removeMllpFraming,
  unescapeHL7,
  parseRawHL7ToString,
  parseRawStringToHL7Buffer,
  isValidMessage: isValidHL7Message
};
