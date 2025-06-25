const {parseHL7ToJson} = require('./hl7toJson');
const messageStructure = {
    VT: '<VT>',    // Start Block character (Vertical Tab)
    CR: '<CR>',    // Carriage Return (segment separator)
    FS: '<FS>',    // File Separator
    END_BLOCK:  '<FS><CR>'  // Message end: <FS><CR>
};

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
        console.log(parseHL7ToJson(message));
        return jsonData[segmentType]?.[0] || '';
    },

    getInformationBySegmentType(message, segmentType, fieldIndex) {
        const segmentData = this.getSegmentData(message, segmentType);

        if (!segmentData) return 'empty';

        const fields = segmentData.split('|');
        return fields[fieldIndex - 1] || 'empty';
    },

};



module.exports = { messageStructure, hl7Utils };
