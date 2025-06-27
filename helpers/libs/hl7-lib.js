const log = require('../logging/logger')


const { MESSAGE_STRUCTURE_AS_STRING, HL7_FRAMING } = require('../utils/buffers')
const { HL7Example4 } = require('../../simulators/hl-7/messages')


  // Clean message - remove control characters
  const cleanMessage = (message) => {
      return message.replace(new RegExp('^' + HL7_FRAMING.START_BLOCK), '') // Remove start character
    .replace(new RegExp(HL7_FRAMING.SEGMENT_SEPARATOR + '$'), '') // Remove segment separator
    .replace(new RegExp(HL7_FRAMING.END_BLOCK + '$'), '') // Remove end characters
    .trim();
  }


/**
 * Unescape HL7 special characters
 * @param {string} text - Text to unescape
 * @returns {string} Unescaped text
 */
const unescapeHL7 = (text) => {
    if (!text) return ''

    return text
        .replace(/\\F\\/g, '|')      // Field separator
        .replace(/\\S\\/g, '^')      // Component separator
        .replace(/\\T\\/g, '&')      // Subcomponent separator
        .replace(/\\R\\/g, '~')      // Repeat separator
        .replace(/\\E\\/g, '\\')    // Escape character
  }

    const parseMessage = (rawMessage) => {

        const message = rawMessage.toString('utf8')
        // Remove start block if present
        let cleaned = message.charCodeAt(0) === HL7_FRAMING.START_BLOCK
            ? message.substring(1)
            : message;

            cleaned = cleaned.slice(0, -HL7_FRAMING.END_BLOCK);

        // Split by segment separator (CR) and filter empty segments
         return cleaned
             .split(String.fromCharCode(HL7_FRAMING.SEGMENT_SEPARATOR))
            .filter(segment => segment.trim().length > 0);

    }

    const isValidMessage = (message) => {
        return message.charCodeAt(0) === MESSAGE_STRUCTURE_AS_STRING.START_BLOCK &&
            message.charCodeAt(message.length - 2) === MESSAGE_STRUCTURE_AS_STRING.FS &&
            message.charCodeAt(message.length - 1) === MESSAGE_STRUCTURE_AS_STRING.SEGMENT_SEPARATOR;
    }


    const HL7toJson = (rawMessage) => {

        const message = parseMessage(rawMessage)

        const segments = message
        const json = {}

    segments.forEach(segment => {

        const fields = segment.split('|')
        const segmentType = fields[0]

        if (!json[segmentType]) {
            json[segmentType] = []
        }

        // Remove only the segment type, keep the rest of the segment
        json[segmentType].push(segment.substring(segmentType.length))
    })
        return json;

    }

    const getQuantityOfSegments = (message) => {

        const segments = HL7toJson(message).MSH[0];

        const fields = segments.split('|');

        return {
            count: fields.length - 1, // Subtract 1 because first element is empty after split
            positions: fields.map((_, index) => index + 1).slice(1) // Skip first empty element
        };
    }

    const getSegmentData = (rawMessage, segmentType) => {

        const jsonData = HL7toJson(rawMessage);

        if(jsonData[segmentType]?.[0]) {
            const fallback = jsonData[segmentType][0];
            return fallback;
        }

        return 'empty';
    }

    const getInformationBySegmentTypeAndIndex = (message, segmentType, fieldIndex) => {

        const segmentData = getSegmentData(message, segmentType);

        if (!segmentData) return 'empty';

        const fields = segmentData.split('|');

        return fields[fieldIndex - 1] || 'empty';
    }

    const getInformationBySegmentType = (message, segmentType) => {
        const type = segmentType.toUpperCase();
        const jsonData = HL7toJson(message);
        const segmentData = jsonData[segmentType];

        return {
            type: type,
            data: segmentData,
            count: segmentData ? segmentData.length : 0,
        }


}

const extractLabValues = (message) => {

    const parsedMessage = parseMessage(message)

    try {
        const messageType = getInformationBySegmentTypeAndIndex(message, 'MSH', 9)
        const hl7Version = getInformationBySegmentTypeAndIndex(message, 'MSH', 12)
        const patientId = getInformationBySegmentTypeAndIndex(message, 'PID', 4) || '-'
        const patientName = getInformationBySegmentTypeAndIndex(message, 'PID', 6) || '-'
        const date = getInformationBySegmentTypeAndIndex(message, 'MSH', 7)
        const instrumentName = getInformationBySegmentTypeAndIndex(message, 'MSH', 3)

        const obxSegments = Object.values(parsedMessage).filter((segment) => segment.startsWith('OBX'))


        const labResults = obxSegments.map((segment) => {

            const fields = segment.split('|')

            const observationField = fields[3]?.split('^') || []

            const unitField = fields[6]?.split('^') || []

            console.log('fields:', fields)

            return {
                sequenceId: fields[1] || '-',
                valueType: fields[2] || '-',
                observationId: observationField[0] || '-',
                observationName: observationField[1] || '-',
                observationSystem: observationField[2] || '-',
                alternateId: observationField[3] || '-',
                alternateName: observationField[4] || '-',
                alternateSystem: observationField[5] || '-',
                value: fields[5] || '-',
                unit: unitField[0] || '-',
                unitSystem: unitField[2] || '-',
                referenceRange: fields[7] || '-',
                abnormalFlags: fields[8] || '-',
                // probability: fields[9] || '-',
                // natureOfAbnormalTest: fields[10] || '-',
                // status: fields[11] || '-',
                // effectiveDate: fields[12] || '-',
                // userDefinedAccessChecks: fields[13] || '-',
                // observationDateTime: fields[14] || '-',
                // producerReference: fields[15] || '-',
                // responsibleObserver: fields[16] || '-',
                // observationMethod: fields[17] || '-',
                // equipmentInstanceId: fields[18] || '-',
                observationTimestamp: fields[19] || '-'
            }
        })

        return {
            messageType,
            hl7Version,
            patientId,
            patientName,
            date,
            instrumentName,
            labResults,
        }
    } catch (error) {
        log.error('Error extracting lab values:', error)
        return {}
    }


}

const parsedMessage = parseMessage(HL7Example4)

const patientName = getInformationBySegmentTypeAndIndex(HL7Example4, 'OBX', 6)
const obx = getInformationBySegmentType(HL7Example4, 'OBX')
const extractedLabValues = extractLabValues(HL7Example4)

console.log('Parsed Message:', parsedMessage)
console.log('name:', patientName)
console.log('Extracted Lab Values:', extractedLabValues)
console.log('OBX:', obx)

module.exports = {
    extractLabValues,
    HL7toJson,
    parseMessage,
    isValidMessage,
    unescapeHL7,
    getQuantityOfSegments,
    getSegmentData,
    getInformationBySegmentType,
    getInformationBySegmentTypeAndIndex,
    };
