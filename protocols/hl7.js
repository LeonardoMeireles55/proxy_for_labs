const log = require('../utils/logger')
const hl7 = require('hl7parser')
const { hl7Utils } = require('./hl7-lib')

const parseHl7Message = (data) => {
    return data.toString('utf8')
}

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


const hl7mes = 'MSH|-¥&|host||cpure||20160712181012+0200||OML^O33^OML_O33|messageId|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-28R^ROCHE<CR>SPM|1|30001||ORH^^HL70487|||||||Q^^HL70369<CR>SAC|||2345678||||||Lot^^99ROC|ABCDEF|9876543<CR>OBX|1|NM|20131^20131^99ROC^^^IHELAW|1|0.100|U/L^^99ROC||10^^99ROC~112^^99ROC~102^^99ROC|||C|||||cobas~REALTIME||c303^ROCHE~3333^ROCHE~1^ROCHE|20191212143110||||||||||RSLT<CR>OBX|2|CE|20131^20131^99ROC^^^IHELAW|1|-2^^99ROC|||10^^99ROC~112^^99ROC~102^^99ROC|||C|||||cobas~REALTIME||c303^ROCHE~3333^ROCHE~1^ROCHE|20191212143110||||||||||RSLT<CR>'

const extracted = extractLabValues(hl7mes)
log.debug('Extracted Lab Values:', extracted)

// Export the parser functions and utilities
module.exports = {
    parseHl7Message,
    extractLabValues,
}
