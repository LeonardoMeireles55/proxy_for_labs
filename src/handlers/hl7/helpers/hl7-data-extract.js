const log = require('../../../../configs/logger')
const { extractEquipmentInfo, extractEquipmentCommandInfo } = require('../segments/equipment')
const { extractMessageHeaderInfo } = require('../segments/header')
const { extractInventoryInfo } = require('../segments/inventory')
const { extractOrderInfo } = require('../segments/order')
const { extractPatientInfo } = require('../segments/patient')
const { extractObxSegments } = require('../segments/results')
const { extractSpecimenInfo } = require('../segments/specimen')
const { extractQcValuesAndConvertToJson } = require('./convert-to-qc-json')
const { cleanObject } = require('./mappers')
const { parseRawHL7ToString } = require('./parser')

/**
 * Comprehensive HL7 message extraction
 */
const extractHl7Data = (message) => {

    try {
        const messageHeader = extractMessageHeaderInfo(message)
        const patientInfo = extractPatientInfo(message)
        const orderInfo = extractOrderInfo(message)
        const specimenInfo = extractSpecimenInfo(message)
        const equipmentInfo = extractEquipmentInfo(message)
        const equipmentCommandInfo = extractEquipmentCommandInfo(message)
        const inventoryInfo = extractInventoryInfo(message)
        const labResults = extractObxSegments(parseRawHL7ToString(message))

        const data = cleanObject({
            ...(Object.keys(messageHeader).length && { messageHeader }),
            ...(Object.keys(patientInfo).length && { patient: patientInfo }),
            ...(Object.keys(orderInfo).length && { order: orderInfo }),
            ...(Object.keys(specimenInfo).length && { specimen: specimenInfo }),
            ...(Object.keys(equipmentInfo).length && { equipment: equipmentInfo }),
            ...(Object.keys(equipmentCommandInfo).length && { equipmentCommand: equipmentCommandInfo }),
            ...(Object.keys(inventoryInfo).length && { inventory: inventoryInfo }),
            ...(labResults.length && { results: labResults })
        })

        extractQcValuesAndConvertToJson(data)

        log.debug('Complete HL7 data extracted successfully')

        return data

    } catch (error) {

        log.error('Error extracting complete HL7 data:', error)

        return {}
    }
}

module.exports = {
    extractHl7Data
}
