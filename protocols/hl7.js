const log = require('../utils/logger')
const hl7 = require('hl7parser')

const parseHl7Message = (data) => {
    return hl7.create(data.toString('utf8'))

}


const extractLabValues = (parsedMessage) => {

    try {
        const messageType = parsedMessage.get('MSH.9').toString()
        const hl7Version = parsedMessage.get('MSH.12').toString()
        const patientId = parsedMessage.get('PID.31').toString()
        const date  = parsedMessage.get('MSH.7').toString()
        const instrumentName = parsedMessage.get('MSH.3').toString()



        return {
            patientId: patientId,
            date: date,
            instrumentName: instrumentName,
        }

    } catch (error) {
        log.error('Error extracting lab values:', error)
        return {}
    }
}

const getResultStatus = (abnormalFlags) => {
    if (!abnormalFlags) return 'Normal'

    const statusMap = {
        'H': 'High',
        'L': 'Low',
        'N': 'Normal',
        'A': 'Abnormal',
        'AA': 'Very Abnormal',
        'null': 'Normal'
    }

    return statusMap[abnormalFlags] || abnormalFlags
}


log.info(extractLabValues(parseHl7Message('MSH|-¥&|cpure||host||20160724080600+0200||OML^O34^OML_O42|1236|P|2.5.1|||||UNICODE UTF-8|||LAB-28R^ROCHE<CR>MSA|AA|1236<CR><FS><CR>')
).date)

// Export the parser functions and utilities
module.exports = {
    parseHl7Message,
    extractLabValues,
}
