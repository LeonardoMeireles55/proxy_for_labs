const { extractPatientInfo } = require('./segments/patient')
const { extractOrderInfo } = require('./segments/order')
const { extractEquipmentInfo, extractEquipmentCommandInfo } = require('./segments/equipment')
const { extractMessageHeaderInfo } = require('./segments/header')
const { extractInventoryInfo } = require('./segments/inventory')
const { extractSpecimenInfo } = require('./segments/specimen')
const { extractObxSegments } = require('./segments/results')
const { parseMessage } = require('./helpers/core')
const { cleanObject } = require('./helpers/mappers')
const log = require('../shared/logger')

/**
 * Comprehensive HL7 message extraction
 */
const extractCompleteHL7Data = (message) => {
    console.log('Extracting complete HL7 data...', parseMessage(message))

    try {
        const messageHeader = extractMessageHeaderInfo(message)
        const patientInfo = extractPatientInfo(message)
        const orderInfo = extractOrderInfo(message)
        const specimenInfo = extractSpecimenInfo(message)
        const equipmentInfo = extractEquipmentInfo(message)
        const equipmentCommandInfo = extractEquipmentCommandInfo(message)
        const inventoryInfo = extractInventoryInfo(message)
        const labResults = extractObxSegments(parseMessage(message))

        return cleanObject({
            ...(Object.keys(messageHeader).length && { messageHeader }),
            ...(Object.keys(patientInfo).length && { patient: patientInfo }),
            ...(Object.keys(orderInfo).length && { order: orderInfo }),
            ...(Object.keys(specimenInfo).length && { specimen: specimenInfo }),
            ...(Object.keys(equipmentInfo).length && { equipment: equipmentInfo }),
            ...(Object.keys(equipmentCommandInfo).length && { equipmentCommand: equipmentCommandInfo }),
            ...(Object.keys(inventoryInfo).length && { inventory: inventoryInfo }),
            ...(labResults.length && { results: labResults })
        })

    } catch (error) {
        log.error('Error extracting complete HL7 data:', error)
        return {}
    }
}

// Re-export principais funções para compatibilidade
module.exports = {
    extractCompleteHL7Data,
    ...require('./helpers/core'),
    ...require('./helpers/parser')
}
