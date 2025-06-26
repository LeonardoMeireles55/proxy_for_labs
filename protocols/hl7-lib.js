const log = require('../utils/logger')

const mockCobasMessage = 'MSH|-¥&|cpure||host||20180220160418+0100||OUL^R23^OUL_R23|19|P|2.5.1|||NE|AL||UNICODE·UTF-8|||LAB-29C^ROCHE<CR>SPM||20901&CALIBRATOR||ORH^^HL70487|||||||C^^HL70369||||||||20200630<CR>OBX|1||20470^20470^99ROC|Curve||||LotCalib^^99ROC|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level1|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403||18<CR>SAC|||20901^CALIBRATOR|||||||999999|0<CR>OBR|1|""||20470^^99ROC||||||||||||||||||||||||||||||||||||||||||Full^^99ROC<CR>ORC|SC||||CM<CR>OBX|1|NA|20470^20470^99ROC|Signal|0.0000~0.0002^0.0002^0.0406^0.0001^0.0411~0.0271^0.0273^0.1731^0.0269^0.1735~0.0000^^^^~0.0000^^^^~0.0000^^^^~0.0000^^^^~^^^^^^^^^^^^^^~0.000000^375^^^^|Î¼mol/L^^99ROC||""|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level1|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403<CR>INV|2047001|OK^^HL70383~CURRENT^^99ROC|R1|513|1|14||||||20190430||||261813<CR>INV|2047001|OK^^HL70383~CURRENT^^99ROC|R3|513|1|14||||||20190430||||261813<CR>OBX|2|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other·Supplemental^IHELAW|Signal|20180220160359~20180220160403|||""|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level1|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403<CR>SPM||20401&CALIBRATOR||ORH^^HL70487|||||||C^^HL70369||||||||20181230<CR>OBX|1||20470^20470^99ROC|Curve||||LotCalib^^99ROC|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level2|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403||18<CR>SAC|||20401^CALIBRATOR|||||||186423|0<CR>OBR|1|""||20470^^99ROC||||||||||||||||||||||||||||||||||||||||||Full^^99ROC<CR>ORC|SC||||CM<CR>OBX|1|NA|20470^20470^99ROC|Signal|0.0000~0.0002^0.0002^0.0406^0.0001^0.0411~0.0271^0.0273^0.1731^0.0269^0.1735~0.0000^^^^~0.0000^^^^~0.0000^^^^~0.0000^^^^~^^^^^^^^^^^^^^~0.000000^375^^^^|Î¼mol/L^^99ROC||""|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level2|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403<CR>INV|2047001|OK^^HL70383~CURRENT^^99ROC|R1|513|1|14||||||20190430||||261813<CR>INV|2047001|OK^^HL70383~CURRENT^^99ROC|R3|513|1|14||||||20190430||||261813<CR>OBX|2|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other·Supplemental^IHELAW|Signal|20180220160414~20180220160417|||""|||F|||||lauberd1~REALTIME|Full~LinearRegression~Level2|c303^ROCHE~3333^ROCHE~1^ROCHE|20180220155403<CR><FS><CR>'
const { MESSAGE_STRUCTURE_AS_STRING, HL7_FRAMING, HL7_SEPARATORS } = require('./buffers')



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

    const parseMessage = (message) => {
        // Remove start block if present
        let cleaned = message.charCodeAt(0) === MESSAGE_STRUCTURE_AS_STRING.START_BLOCK
            ? message.substring(1)
            : message;

        // Remove end block if present
        if (cleaned.endsWith(MESSAGE_STRUCTURE_AS_STRING.END_BLOCK)) {
            cleaned = cleaned.slice(0, -MESSAGE_STRUCTURE_AS_STRING.END_BLOCK.length);
        }

        // Split by segment separator (CR) and filter empty segments
         return cleaned
             .split((MESSAGE_STRUCTURE_AS_STRING.SEGMENT_SEPARATOR))
            .filter(segment => segment.trim().length > 0);

    }

    const isValidMessage = (message) => {
        return message.charCodeAt(0) === MESSAGE_STRUCTURE_AS_STRING.START_BLOCK &&
            message.charCodeAt(message.length - 2) === MESSAGE_STRUCTURE_AS_STRING.FS &&
            message.charCodeAt(message.length - 1) === MESSAGE_STRUCTURE_AS_STRING.CR;
    }


    const HL7toJson = (message) => {
        const segments = message
        const json = {}

    segments.forEach(segment => {

        const fields = segment.split('|')
        const segmentType = fields[0]

        if (!json[segmentType]) {
            json[segmentType] = []
        }

        json[segmentType].push(segment.slice(3, 10000))
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

    const getSegmentData = (message, segmentType) => {
        const jsonData = HL7toJson(message);
        return jsonData[segmentType]?.[0] || 'empty';
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

    log.debug('Parsed HL7:', parsedMessage)

    try {
        const messageType = getInformationBySegmentTypeAndIndex(parsedMessage, 'MSH', 9).toString()
        const hl7Version = getInformationBySegmentTypeAndIndex(parsedMessage, 'MSH', 12).toString()
        const patientId = getInformationBySegmentTypeAndIndex(parsedMessage, 'PID', 3)?.toString() || null
        const date = getInformationBySegmentTypeAndIndex(parsedMessage, 'MSH', 7).toString()
        const instrumentName = getInformationBySegmentTypeAndIndex(parsedMessage, 'MSH', 3).toString()

        const obxSegments = Object.values(parsedMessage).filter((segment) => segment.startsWith('OBX'))


        const labResults = obxSegments.map((segment) => {
            const fields = segment.split('|')
            return {
                observationId: fields[3]?.split('^')[0] || null,
                value: fields[5] || null,
                unit: fields[6]?.split('^')[0] || null,
                observationTimestamp: fields[19] || null,
                status: fields[11] || null,
            }
        })

        return {
            messageType,
            hl7Version,
            patientId,
            date,
            instrumentName,
            labResults,
        }
    } catch (error) {
        log.error('Error extracting lab values:', error)
        return {}
    }
};


const extracted = extractLabValues(mockCobasMessage)


log.debug('Extracted Lab Values:', extracted)


const json = HL7toJson(parseMessage(mockCobasMessage))
log.debug('HL7 Message Type:', json)

const debug = getInformationBySegmentType(parseMessage(mockCobasMessage), 'OBX')
log.debug('Debug Information:', debug)



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
