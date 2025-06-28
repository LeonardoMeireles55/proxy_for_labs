const { parseMessage } = require('./core')
const log = require('../../../shared/logger')

/**
 * Convert HL7 message to JSON structure
 */
const HL7toJson = (rawMessage) => {
    const segments = parseMessage(rawMessage)
    const json = {}

    segments.forEach(segment => {
        const fields = segment.split('|')
        const segmentType = fields[0]

        if (!json[segmentType]) {
            json[segmentType] = []
        }

        json[segmentType].push(segment.substring(segmentType.length))
    })

    return json
}

/**
 * Get specific segment data by type
 */
const getSegmentData = (rawMessage, segmentType) => {
    const jsonData = HL7toJson(rawMessage)
    return jsonData[segmentType]?.[0] || null
}

/**
 * Get field value by segment type and field index
 */
const getInformationBySegmentTypeAndIndex = (message, segmentType, fieldIndex) => {
    const segmentData = getSegmentData(message, segmentType)
    if (!segmentData) return null

    const fields = segmentData.split('|')
    return fields[fieldIndex] || null
}

/**
 * Parse MSH segment for control information
 */
const parseMshSegment = (cleanMessage) => {
    const mshSegment = cleanMessage.split('\r')[0]
    const mshFields = mshSegment.split('|')

    const messageControlId = mshFields[9] || 'DEFAULT'
    const msh9 = mshFields[8] || 'ORU^R01^ORU_R01'
    const triggerEvent = msh9.split('^')[1] || 'R01'

    log.debug('Extracted MSH fields:', { messageControlId, msh9, triggerEvent })

    return { messageControlId, triggerEvent }
}

module.exports = {
    HL7toJson,
    getSegmentData,
    getInformationBySegmentTypeAndIndex,
    parseMshSegment
}
