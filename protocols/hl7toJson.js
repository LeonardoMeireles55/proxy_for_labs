/**
 * Simple HL7 v2.x to JSON Parser
 * Converts HL7 messages to structured JSON format
 */

const HL7_SEPARATORS = {
  FIELD: '|',
  COMPONENT: '^',
  SUBCOMPONENT: '&',
  REPEAT: '~',
  ESCAPE: '\\'
};

const HL7_CONTROL_CHARS = {
  START: String.fromCharCode(0x0B),
  SEGMENT_END: String.fromCharCode(0x0D),
  MESSAGE_END: String.fromCharCode(0x1C) + String.fromCharCode(0x0D)
};

/**
 * Parse HL7 message to JSON
 * @param {string} hl7Message - Raw HL7 message string
 * @returns {object} Parsed HL7 message as JSON
 */
function parseHL7ToJson(hl7Message) {
  if (!hl7Message || typeof hl7Message !== 'string') {
    throw new Error('Invalid HL7 message');
  }

  // Clean message - remove control characters
  const cleanMessage = hl7Message
    .replace(new RegExp('^' + HL7_CONTROL_CHARS.START), '') // Remove start character
    .replace(new RegExp(HL7_CONTROL_CHARS.MESSAGE_END + '$'), '') // Remove end characters
    .trim();

  // Split into segments
  const segments = cleanMessage.split(HL7_CONTROL_CHARS.SEGMENT_END).filter(seg => seg.length > 0);

  const result = {
    messageType: null,
    segments: {}
  };

  segments.forEach((segment, index) => {
    const parsedSegment = parseSegment(segment);
    if (parsedSegment) {
      const segmentType = parsedSegment.type;

      // Set message type from MSH segment
      if (segmentType === 'MSH') {
        result.messageType = parsedSegment.fields[8]?.value || 'UNKNOWN';
      }

      // Handle multiple segments of same type
      if (result.segments[segmentType]) {
        if (!Array.isArray(result.segments[segmentType])) {
          result.segments[segmentType] = [result.segments[segmentType]];
        }
        result.segments[segmentType].push(parsedSegment);
      } else {
        result.segments[segmentType] = parsedSegment;
      }
    }
  });

  return result;
}

/**
 * Parse individual HL7 segment
 * @param {string} segment - Single HL7 segment
 * @returns {object} Parsed segment
 */
function parseSegment(segment) {
  if (!segment || segment.length < 3) return null;

  const segmentType = segment.substring(0, 3);
  const fields = segment.split(HL7_SEPARATORS.FIELD);

  const parsedFields = {};

  // Start from index 1 (skip segment type)
  fields.slice(1).forEach((field, index) => {
    if (field) {
      parsedFields[index + 1] = parseField(field);
    }
  });

  return {
    type: segmentType,
    fields: parsedFields
  };
}

/**
 * Parse HL7 field (handles components and subcomponents)
 * @param {string} field - HL7 field string
 * @returns {object} Parsed field
 */
function parseField(field) {
  if (!field) return { value: '' };

  // Handle repeating fields
  if (field.includes(HL7_SEPARATORS.REPEAT)) {
    const repeats = field.split(HL7_SEPARATORS.REPEAT);
    return {
      repeating: true,
      values: repeats.map(repeat => parseFieldComponents(repeat))
    };
  }

  return parseFieldComponents(field);
}

/**
 * Parse field components and subcomponents
 * @param {string} field - Field string
 * @returns {object} Parsed components
 */
function parseFieldComponents(field) {
  if (!field.includes(HL7_SEPARATORS.COMPONENT)) {
    return { value: unescapeHL7(field) };
  }

  const components = field.split(HL7_SEPARATORS.COMPONENT);
  const parsedComponents = [];

  components.forEach((component, index) => {
    if (component.includes(HL7_SEPARATORS.SUBCOMPONENT)) {
      const subcomponents = component.split(HL7_SEPARATORS.SUBCOMPONENT);
      parsedComponents[index] = {
        subcomponents: subcomponents.map(sub => unescapeHL7(sub))
      };
    } else {
      parsedComponents[index] = { value: unescapeHL7(component) };
    }
  });

  return { components: parsedComponents };
}

/**
 * Unescape HL7 special characters
 * @param {string} text - Text to unescape
 * @returns {string} Unescaped text
 */
function unescapeHL7(text) {
  if (!text) return '';

  return text
    .replace(/\\F\\/g, '|')      // Field separator
    .replace(/\\S\\/g, '^')      // Component separator
    .replace(/\\T\\/g, '&')      // Subcomponent separator
    .replace(/\\R\\/g, '~')      // Repeat separator
    .replace(/\\E\\/g, '\\');    // Escape character
}

/**
 * Get segment by type from parsed HL7
 * @param {object} parsedHL7 - Parsed HL7 message
 * @param {string} segmentType - Segment type (e.g., 'MSH', 'PID')
 * @returns {object|array|null} Segment data
 */
function getSegment(parsedHL7, segmentType) {
  return parsedHL7.segments[segmentType] || null;
}

/**
 * Extract patient ID from PID segment
 * @param {object} parsedHL7 - Parsed HL7 message
 * @returns {string|null} Patient ID
 */
function getPatientId(parsedHL7) {
  const pid = getSegment(parsedHL7, 'PID');
  return pid?.fields[3]?.value || null;
}

module.exports = {
  parseHL7ToJson,
  parseSegment,
  getSegment,
  getPatientId,
  HL7_SEPARATORS,
  HL7_CONTROL_CHARS
};
