const log = require('../../utils/logger')


function convertAstmToJson(astmMessage) {
    const dataString = astmMessage.toString('latin1').split(/[\r\n]+/).filter(Boolean)

    const segments = dataString
    const headerSegment = segments.find(function (segment) { return segment.startsWith('H|') })
    const orderSegment = segments.find(function (segment) { return segment.startsWith('O|') })
    const resultSegment = segments.find(function (segment) { return segment.startsWith('R|') })
    const calibrationSegments = segments.filter(function (segment) { return segment.startsWith('C|') })

    const results = {
        rawData: dataString,
    }


    log.debug('ASTM to JSON conversion results:', results);
    return results;
}

module.exports = { convertAstmToJson };
