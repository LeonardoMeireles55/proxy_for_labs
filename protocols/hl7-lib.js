const log = require('../utils/logger')

const mockCobasMessage = 'MSH|-¥&|host||cpure||20160712181012+0200||OML^O33^OML_O33|messageId|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-28R^ROCHE<CR>SPM|1|30001||ORH^^HL70487|||||||Q^^HL70369<CR>SAC|||2345678||||||Lot^^99ROC|ABCDEF|9876543<CR>OBX|1|NM|20131^20131^99ROC^^^IHELAW|1|0.100|U/L^^99ROC||10^^99ROC~112^^99ROC~102^^99ROC|||C|||||cobas~REALTIME||c303^ROCHE~3333^ROCHE~1^ROCHE|20191212143110||||||||||RSLT<CR>OBX|2|CE|20131^20131^99ROC^^^IHELAW|1|-2^^99ROC|||10^^99ROC~112^^99ROC~102^^99ROC|||C|||||cobas~REALTIME||c303^ROCHE~3333^ROCHE~1^ROCHE|20191212143110||||||||||RSLT<CR>'

const messageStructure = {
    VT: '<VT>',    // Start Block character (Vertical Tab)
    CR: '<CR>',    // Carriage Return (segment separator)
    FS: '<FS>',    // File Separator
    END_BLOCK:  '<FS><CR>'  // Message end: <FS><CR>
};

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


  // Clean message - remove control characters
  const cleanMessage = (message) => {
    message.replace(new RegExp('^' + HL7_CONTROL_CHARS.START), '') // Remove start character
    .replace(new RegExp(HL7_CONTROL_CHARS.MESSAGE_END + '$'), '') // Remove end characters
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


// Helper functions for HL7 message construction
const hl7Utils = {
    createMessage(segments) {
        const startBlock = messageStructure.VT;
        const segmentSep = messageStructure.FS
        const endBlock = messageStructure.END_BLOCK;

        return startBlock + segments.join(segmentSep) + endBlock;
    },

    parseMessage(message) {
        // Remove start block if present
        let cleaned = message.charCodeAt(0) === messageStructure.VT
            ? message.substring(1)
            : message;

        // Remove end block if present
        if (cleaned.endsWith(messageStructure.END_BLOCK)) {
            cleaned = cleaned.slice(0, -8);
        }

        // Split by segment separator (CR) and filter empty segments
        return cleaned
            .split((messageStructure.CR))
            .filter(segment => segment.trim().length > 0);
    },

    isValidMessage(message) {
        return message.charCodeAt(0) === messageStructure.START_BLOCK &&
               message.charCodeAt(message.length - 2) === messageStructure.FS &&
               message.charCodeAt(message.length - 1) === messageStructure.CR;
    },


    toJson(message) {
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

    },

    getQuantityOfSegments(message) {
        const segments = this.toJson(message).MSH[0];
        const fields = segments.split('|');

        return {
            count: fields.length - 1, // Subtract 1 because first element is empty after split
            positions: fields.map((_, index) => index + 1).slice(1) // Skip first empty element
        };
    },

    getSegmentData(message, segmentType) {
        const jsonData = this.toJson(message);
        return jsonData[segmentType]?.[0] || '';
    },

    getInformationBySegmentType(message, segmentType, fieldIndex) {
        const segmentData = this.getSegmentData(message, segmentType);

        if (!segmentData) return 'empty';

        const fields = segmentData.split('|');
        return fields[fieldIndex - 1] || 'empty';
    },

};

const extractLabValues = (message) => {

    const parsedMessage = hl7Utils.parseMessage(message)

    log.debug('Parsed HL7:', parsedMessage)

    try {
        const messageType = hl7Utils.getInformationBySegmentType(parsedMessage, 'MSH', 9).toString()
        const hl7Version = hl7Utils.getInformationBySegmentType(parsedMessage, 'MSH', 12).toString()
        const patientId = hl7Utils.getInformationBySegmentType(parsedMessage, 'PID', 3).toString()
        const date = hl7Utils.getInformationBySegmentType(parsedMessage, 'MSH', 7).toString()
        const instrumentName = hl7Utils.getInformationBySegmentType(parsedMessage, 'MSH', 3).toString()


        return {
            messageType,
            hl7Version,
            patientId,
            date,
            instrumentName,
        }

    } catch (error) {
        log.error('Error extracting lab values:', error)
        return {}
    }
}

const extracted = extractLabValues(mockCobasMessage)
log.debug('Extracted Lab Values:', extracted)



module.exports = { messageStructure, hl7Utils, extractLabValues };
