const log = require('../../utils/logger')


function convertHl7ToJson(astmMessage, encoding = 'utf8') {
    const dataString = astmMessage.toString(encoding).split(/[\r\n]+/).filter(Boolean)

    const results = {
        rawData: dataString,
    }


    log.debug('HL7 to JSON conversion results:', results)
    return results
}

module.exports = { convertHl7ToJson }
