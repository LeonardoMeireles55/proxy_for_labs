const log = require('../logging/logger')

const { MESSAGE_STRUCTURE_AS_STRING, HL7_FRAMING } = require('../utils/buffers')
const { HL7Example4 } = require('../../simulators/hl-7/messages')


/**
 * Remove MLLP framing characters from HL7 message
 * @param {string} messageStr - Raw message string
 * @returns {string} Clean message without MLLP framing
 */
const removeMllpFraming = (messageStr) => {
    let cleanMessage = messageStr

    // Remove VT (0x0B) start character
    if (messageStr.charCodeAt(0) === 0x0B) {
        cleanMessage = messageStr.slice(1)
    }

    // Remove FS+CR (0x1C+0x0D) end characters
    if (cleanMessage.charCodeAt(cleanMessage.length - 2) === 0x1C) {
        cleanMessage = cleanMessage.slice(0, -2)
    }

    return cleanMessage
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

/**
* Parse MSH segment to extract Message Control ID and trigger event
* @param {string} cleanMessage - HL7 message without MLLP framing
* @returns {Object} Extracted fields { messageControlId, triggerEvent }
*/

const parseMshSegment = (cleanMessage) => {
    // Extract MSH segment (first line)
    const mshSegment = cleanMessage.split('\r')[0]
    const mshFields = mshSegment.split('|')

    log.debug('MSH fields count:', mshFields.length)
    log.debug('MSH fields:', mshFields.slice(0, 12))

    // Extract fields (MSH fields are 1-indexed, arrays are 0-indexed)
    const messageControlId = mshFields[9] || 'DEFAULT'    // MSH-10: Message Control ID
    const msh9 = mshFields[8] || 'ORU^R01^ORU_R01'       // MSH-9: Message Type
    const triggerEvent = msh9.split('^')[1] || 'R01'     // Extract trigger event from MSH-9

    log.debug('Extracted fields:', { messageControlId, msh9, triggerEvent })

    return { messageControlId, triggerEvent }
  }

    const parseMessage = (rawMessage) => {

        const message = rawMessage.toString('utf8')
        // Remove start block if present
        let cleaned = message.charCodeAt(0) === HL7_FRAMING.START_BLOCK
            ? message.substring(1)
            : message;

            cleaned = cleaned.slice(0, -HL7_FRAMING.END_BLOCK);

        // Split by segment separator (CR) and filter empty segments
         return cleaned
             .split(String.fromCharCode(HL7_FRAMING.SEGMENT_SEPARATOR))
            .filter(segment => segment.trim().length > 0);
    }

    const isValidMessage = (message) => {
        return message.charCodeAt(0) === MESSAGE_STRUCTURE_AS_STRING.START_BLOCK &&
            message.charCodeAt(message.length - 2) === MESSAGE_STRUCTURE_AS_STRING.FS &&
            message.charCodeAt(message.length - 1) === MESSAGE_STRUCTURE_AS_STRING.SEGMENT_SEPARATOR;
    }


    const HL7toJson = (rawMessage) => {

        const message = parseMessage(rawMessage)

        const segments = message
        const json = {}

    segments.forEach(segment => {

        const fields = segment.split('|')
        const segmentType = fields[0]

        if (!json[segmentType]) {
            json[segmentType] = []
        }

        // Remove only the segment type, keep the rest of the segment
        json[segmentType].push(segment.substring(segmentType.length))
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

    const getSegmentData = (rawMessage, segmentType) => {

        const jsonData = HL7toJson(rawMessage);

        if(jsonData[segmentType]?.[0]) {
            const fallback = jsonData[segmentType][0];
            return fallback;
        }

        return null;
    }

    const getInformationBySegmentTypeAndIndex = (message, segmentType, fieldIndex) => {

        const segmentData = getSegmentData(message, segmentType);

        if (!segmentData) return null;

        const fields = segmentData.split('|');

        return fields[fieldIndex] || null;
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

const extractObxSegments = (parsedMessage) => {
    return Object.values(parsedMessage)
        .filter(segment => segment.startsWith('OBX'))
        .map(mapObxToLabResult)
        .filter(result => Object.keys(result).length > 0)
}

/**
 * Removes null/undefined/empty values from an object
 */
const cleanObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) =>
            value !== null && value !== undefined && value !== null && value !== ''
        )
    )
}

/**
 * Maps OBX segment to lab result object
 */
const mapObxToLabResult = (segment) => {
    const fields = segment.split('|')
    const observationField = fields[3]?.split('^') || []
    const unitField = fields[6]?.split('^') || []

    const result = {
        sequenceId: fields[1],
        observationName: observationField[1],
        value: fields[5],
        unit: unitField[0],
        referenceRange: fields[7],
        abnormalFlags: fields[8],
        observationTimestamp: fields[19]
    }

    return cleanObject(result)
}

/**
 * Extracts patient information from PID segment
 */
const extractPatientInfo = (message) => {
    return cleanObject({
        setId: getInformationBySegmentTypeAndIndex(message, 'PID', 1),
        patientId: getInformationBySegmentTypeAndIndex(message, 'PID', 2),
        patientIdentifierList: getInformationBySegmentTypeAndIndex(message, 'PID', 3),
        alternatePatientId: getInformationBySegmentTypeAndIndex(message, 'PID', 4),
        patientName: getInformationBySegmentTypeAndIndex(message, 'PID', 5),
        mothersMaidenName: getInformationBySegmentTypeAndIndex(message, 'PID', 6),
        birthDate: getInformationBySegmentTypeAndIndex(message, 'PID', 7),
        administrativeSex: getInformationBySegmentTypeAndIndex(message, 'PID', 8),
        patientAlias: getInformationBySegmentTypeAndIndex(message, 'PID', 9),
        race: getInformationBySegmentTypeAndIndex(message, 'PID', 10),
        patientAddress: getInformationBySegmentTypeAndIndex(message, 'PID', 11),
        countyCode: getInformationBySegmentTypeAndIndex(message, 'PID', 12),
        phoneNumberHome: getInformationBySegmentTypeAndIndex(message, 'PID', 13),
        phoneNumberBusiness: getInformationBySegmentTypeAndIndex(message, 'PID', 14),
        primaryLanguage: getInformationBySegmentTypeAndIndex(message, 'PID', 15),
        maritalStatus: getInformationBySegmentTypeAndIndex(message, 'PID', 16),
        religion: getInformationBySegmentTypeAndIndex(message, 'PID', 17),
        patientAccountNumber: getInformationBySegmentTypeAndIndex(message, 'PID', 18),
        ssnNumber: getInformationBySegmentTypeAndIndex(message, 'PID', 19),
        driversLicenseNumber: getInformationBySegmentTypeAndIndex(message, 'PID', 20),
        mothersIdentifier: getInformationBySegmentTypeAndIndex(message, 'PID', 21),
        ethnicGroup: getInformationBySegmentTypeAndIndex(message, 'PID', 22),
        birthPlace: getInformationBySegmentTypeAndIndex(message, 'PID', 23),
        multipleBirthIndicator: getInformationBySegmentTypeAndIndex(message, 'PID', 24),
        birthOrder: getInformationBySegmentTypeAndIndex(message, 'PID', 25),
        citizenship: getInformationBySegmentTypeAndIndex(message, 'PID', 26),
        veteransMilitaryStatus: getInformationBySegmentTypeAndIndex(message, 'PID', 27),
        nationality: getInformationBySegmentTypeAndIndex(message, 'PID', 28),
        patientDeathDateTime: getInformationBySegmentTypeAndIndex(message, 'PID', 29),
        patientDeathIndicator: getInformationBySegmentTypeAndIndex(message, 'PID', 30),
        identityUnknownIndicator: getInformationBySegmentTypeAndIndex(message, 'PID', 31),
        identityReliabilityCode: getInformationBySegmentTypeAndIndex(message, 'PID', 32),
        lastUpdateDateTime: getInformationBySegmentTypeAndIndex(message, 'PID', 33),
        lastUpdateFacility: getInformationBySegmentTypeAndIndex(message, 'PID', 34),
        speciesCode: getInformationBySegmentTypeAndIndex(message, 'PID', 35),
        breedCode: getInformationBySegmentTypeAndIndex(message, 'PID', 36),
        strain: getInformationBySegmentTypeAndIndex(message, 'PID', 37),
        productionClassCode: getInformationBySegmentTypeAndIndex(message, 'PID', 38),
        tribalCitizenship: getInformationBySegmentTypeAndIndex(message, 'PID', 39)
    })
}

/**
 * Extracts complete order information from OBR segment
 */
const extractOrderInfo = (message) => {
    return cleanObject({
        setId: getInformationBySegmentTypeAndIndex(message, 'OBR', 1),
        placerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 2),
        fillerOrderNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 3),
        universalServiceIdentifier: getInformationBySegmentTypeAndIndex(message, 'OBR', 4),
        priority: getInformationBySegmentTypeAndIndex(message, 'OBR', 5),
        requestDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 6),
        observationDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 7),
        observationEndDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 8),
        collectionVolume: getInformationBySegmentTypeAndIndex(message, 'OBR', 9),
        collectorIdentifier: getInformationBySegmentTypeAndIndex(message, 'OBR', 10),
        specimenActionCode: getInformationBySegmentTypeAndIndex(message, 'OBR', 11),
        dangerCode: getInformationBySegmentTypeAndIndex(message, 'OBR', 12),
        relevantClinicalInfo: getInformationBySegmentTypeAndIndex(message, 'OBR', 13),
        specimenReceivedDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 14),
        specimenSource: getInformationBySegmentTypeAndIndex(message, 'OBR', 15),
        orderingProvider: getInformationBySegmentTypeAndIndex(message, 'OBR', 16),
        orderCallbackPhone: getInformationBySegmentTypeAndIndex(message, 'OBR', 17),
        placerField1: getInformationBySegmentTypeAndIndex(message, 'OBR', 18),
        placerField2: getInformationBySegmentTypeAndIndex(message, 'OBR', 19),
        fillerField1: getInformationBySegmentTypeAndIndex(message, 'OBR', 20),
        fillerField2: getInformationBySegmentTypeAndIndex(message, 'OBR', 21),
        resultsReportStatusChangeDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 22),
        chargeToPractice: getInformationBySegmentTypeAndIndex(message, 'OBR', 23),
        diagnosticServiceSectionId: getInformationBySegmentTypeAndIndex(message, 'OBR', 24),
        resultStatus: getInformationBySegmentTypeAndIndex(message, 'OBR', 25),
        parentResult: getInformationBySegmentTypeAndIndex(message, 'OBR', 26),
        quantityTiming: getInformationBySegmentTypeAndIndex(message, 'OBR', 27),
        resultCopiesTo: getInformationBySegmentTypeAndIndex(message, 'OBR', 28),
        parentNumber: getInformationBySegmentTypeAndIndex(message, 'OBR', 29),
        transportationMode: getInformationBySegmentTypeAndIndex(message, 'OBR', 30),
        reasonForStudy: getInformationBySegmentTypeAndIndex(message, 'OBR', 31),
        principalResultInterpreter: getInformationBySegmentTypeAndIndex(message, 'OBR', 32),
        assistantResultInterpreter: getInformationBySegmentTypeAndIndex(message, 'OBR', 33),
        technician: getInformationBySegmentTypeAndIndex(message, 'OBR', 34),
        transcriptionist: getInformationBySegmentTypeAndIndex(message, 'OBR', 35),
        scheduledDateTime: getInformationBySegmentTypeAndIndex(message, 'OBR', 36),
        numberOfSampleContainers: getInformationBySegmentTypeAndIndex(message, 'OBR', 37),
        transportLogistics: getInformationBySegmentTypeAndIndex(message, 'OBR', 38),
        collectorComment: getInformationBySegmentTypeAndIndex(message, 'OBR', 39),
        transportArrangementResponsibility: getInformationBySegmentTypeAndIndex(message, 'OBR', 40),
        transportArranged: getInformationBySegmentTypeAndIndex(message, 'OBR', 41),
        escortRequired: getInformationBySegmentTypeAndIndex(message, 'OBR', 42),
        plannedPatientTransportComment: getInformationBySegmentTypeAndIndex(message, 'OBR', 43)
    })
}

/**
 * Extracts specimen information from SPM segment
 */
const extractSpecimenInfo = (message) => {
    return cleanObject({
        setId: getInformationBySegmentTypeAndIndex(message, 'SPM', 1),
        specimenId: getInformationBySegmentTypeAndIndex(message, 'SPM', 2),
        specimenParentIds: getInformationBySegmentTypeAndIndex(message, 'SPM', 3),
        specimenType: getInformationBySegmentTypeAndIndex(message, 'SPM', 4),
        specimenTypeModifier: getInformationBySegmentTypeAndIndex(message, 'SPM', 5),
        specimenAdditives: getInformationBySegmentTypeAndIndex(message, 'SPM', 6),
        specimenCollectionMethod: getInformationBySegmentTypeAndIndex(message, 'SPM', 7),
        specimenSourceSite: getInformationBySegmentTypeAndIndex(message, 'SPM', 8),
        specimenSourceSiteModifier: getInformationBySegmentTypeAndIndex(message, 'SPM', 9),
        specimenCollectionSite: getInformationBySegmentTypeAndIndex(message, 'SPM', 10),
        specimenRole: getInformationBySegmentTypeAndIndex(message, 'SPM', 11),
        specimenCollectionAmount: getInformationBySegmentTypeAndIndex(message, 'SPM', 12),
        groupedSpecimenCount: getInformationBySegmentTypeAndIndex(message, 'SPM', 13),
        specimenDescription: getInformationBySegmentTypeAndIndex(message, 'SPM', 14),
        specimenHandlingCode: getInformationBySegmentTypeAndIndex(message, 'SPM', 15),
        specimenRiskCode: getInformationBySegmentTypeAndIndex(message, 'SPM', 16),
        specimenCollectionDateTime: getInformationBySegmentTypeAndIndex(message, 'SPM', 17),
        specimenReceivedDateTime: getInformationBySegmentTypeAndIndex(message, 'SPM', 18),
        specimenExpirationDateTime: getInformationBySegmentTypeAndIndex(message, 'SPM', 19),
        specimenAvailability: getInformationBySegmentTypeAndIndex(message, 'SPM', 20),
        specimenRejectReason: getInformationBySegmentTypeAndIndex(message, 'SPM', 21),
        specimenQuality: getInformationBySegmentTypeAndIndex(message, 'SPM', 22),
        specimenAppropriateness: getInformationBySegmentTypeAndIndex(message, 'SPM', 23),
        specimenCondition: getInformationBySegmentTypeAndIndex(message, 'SPM', 24),
        specimenCurrentQuantity: getInformationBySegmentTypeAndIndex(message, 'SPM', 25),
        numberOfSpecimenContainers: getInformationBySegmentTypeAndIndex(message, 'SPM', 26),
        containerType: getInformationBySegmentTypeAndIndex(message, 'SPM', 27),
        containerCondition: getInformationBySegmentTypeAndIndex(message, 'SPM', 28),
        specimenChildRole: getInformationBySegmentTypeAndIndex(message, 'SPM', 29)
    })
}

/**
 * Extracts complete message header information from MSH segment
 */
const extractMessageHeaderInfo = (message) => {
    return cleanObject({
        fieldSeparator: getInformationBySegmentTypeAndIndex(message, 'MSH', 1),
        encodingCharacters: getInformationBySegmentTypeAndIndex(message, 'MSH', 2),
        sendingApplication: getInformationBySegmentTypeAndIndex(message, 'MSH', 3),
        sendingFacility: getInformationBySegmentTypeAndIndex(message, 'MSH', 4),
        receivingApplication: getInformationBySegmentTypeAndIndex(message, 'MSH', 5),
        receivingFacility: getInformationBySegmentTypeAndIndex(message, 'MSH', 6),
        dateTimeOfMessage: getInformationBySegmentTypeAndIndex(message, 'MSH', 7),
        security: getInformationBySegmentTypeAndIndex(message, 'MSH', 8),
        messageType: getInformationBySegmentTypeAndIndex(message, 'MSH', 9),
        messageControlId: getInformationBySegmentTypeAndIndex(message, 'MSH', 10),
        processingId: getInformationBySegmentTypeAndIndex(message, 'MSH', 11),
        versionId: getInformationBySegmentTypeAndIndex(message, 'MSH', 12),
        sequenceNumber: getInformationBySegmentTypeAndIndex(message, 'MSH', 13),
        continuationPointer: getInformationBySegmentTypeAndIndex(message, 'MSH', 14),
        acceptAcknowledgmentType: getInformationBySegmentTypeAndIndex(message, 'MSH', 15),
        applicationAcknowledgmentType: getInformationBySegmentTypeAndIndex(message, 'MSH', 16),
        countryCode: getInformationBySegmentTypeAndIndex(message, 'MSH', 17),
        characterSet: getInformationBySegmentTypeAndIndex(message, 'MSH', 18),
        principalLanguageOfMessage: getInformationBySegmentTypeAndIndex(message, 'MSH', 19),
        alternateCharacterSetHandlingScheme: getInformationBySegmentTypeAndIndex(message, 'MSH', 20),
        messageProfileIdentifier: getInformationBySegmentTypeAndIndex(message, 'MSH', 21)
    })
}

/**
 * Extracts equipment information from EQU segment
 */
const extractEquipmentInfo = (message) => {
    return cleanObject({
        equipmentInstanceIdentifier: getInformationBySegmentTypeAndIndex(message, 'EQU', 1),
        eventDateTime: getInformationBySegmentTypeAndIndex(message, 'EQU', 2),
        equipmentState: getInformationBySegmentTypeAndIndex(message, 'EQU', 3),
        localRemoteControlState: getInformationBySegmentTypeAndIndex(message, 'EQU', 4),
        alertLevel: getInformationBySegmentTypeAndIndex(message, 'EQU', 5)
    })
}



/**
 * Extracts equipment command information from ECD segment (Roche cobas®pure)
 */
const extractEquipmentCommandInfo = (message) => {
    const commandParameterField = getInformationBySegmentTypeAndIndex(message, 'ECD', 5)

    // Parse command parameter field (ECD-5)
    // Format: MaskType~TestCode~ModulType~ModuleSerial~Submodul~ReagentCode~ReagentLot~ReagentSequenceNumber
    let commandParameters = {}

    if (commandParameterField && commandParameterField !== null) {
        const params = commandParameterField.split('~')
        commandParameters = {
            maskType: params[0] || null,           // P=Patient, T=Test, R=Reagent
            testCode: params[1] || null,           // Test code (ACN)
            moduleType: params[2] || null,         // Module type
            moduleSerial: params[3] || null,       // Module serial number
            submodule: params[4] || null,          // Submodule
            reagentCode: params[5] || null,        // Reagent code
            reagentLot: params[6] || null,         // Reagent lot
            reagentSequenceNumber: params[7] || null // Reagent sequence number
        }
    }

    return cleanObject({
        referenceCommandNumber: getInformationBySegmentTypeAndIndex(message, 'ECD', 1),
        instruction: getInformationBySegmentTypeAndIndex(message, 'ECD', 2),
        commandParameter: commandParameterField,
        ...commandParameters
    })
}

/**
 * Extracts inventory detail information from INV segment
 */
const extractInventoryInfo = (message) => {
    return cleanObject({
        substanceIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 1),
        substanceStatus: getInformationBySegmentTypeAndIndex(message, 'INV', 2),
        substanceType: getInformationBySegmentTypeAndIndex(message, 'INV', 3),
        inventoryContainerIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 4),
        containerCarrierIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 5),
        positionOnCarrier: getInformationBySegmentTypeAndIndex(message, 'INV', 6),
        initialQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 7),
        currentQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 8),
        availableQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 9),
        consumptionQuantity: getInformationBySegmentTypeAndIndex(message, 'INV', 10),
        quantityUnits: getInformationBySegmentTypeAndIndex(message, 'INV', 11),
        expirationDateTime: getInformationBySegmentTypeAndIndex(message, 'INV', 12),
        firstUsedDateTime: getInformationBySegmentTypeAndIndex(message, 'INV', 13),
        onBoardStabilityDuration: getInformationBySegmentTypeAndIndex(message, 'INV', 14),
        testFluidIdentifiers: getInformationBySegmentTypeAndIndex(message, 'INV', 15),
        manufacturerLotNumber: getInformationBySegmentTypeAndIndex(message, 'INV', 16),
        manufacturerIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 17),
        supplierIdentifier: getInformationBySegmentTypeAndIndex(message, 'INV', 18),
        onBoardStabilityTime: getInformationBySegmentTypeAndIndex(message, 'INV', 19),
        targetValue: getInformationBySegmentTypeAndIndex(message, 'INV', 20)
    })
}


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

// const parsedMessage = parseMessage(HL7Example4)

// const patientName = getInformationBySegmentTypeAndIndex(HL7Example4, 'OBX', 6)
// const obx = getInformationBySegmentType(HL7Example4, 'OBX')
// const extractedLabValues = extractLabValues(HL7Example4)

// console.log('Parsed Message:', parsedMessage)
// console.log('name:', patientName)
// console.log('Extracted Lab Values:', extractedLabValues)
// console.log('OBX:', obx)

module.exports = {
    extractCompleteHL7Data,
    extractMessageHeaderInfo,
    extractEquipmentInfo,
    extractEquipmentCommandInfo,
    extractInventoryInfo,
    HL7toJson,
    parseMessage,
    isValidMessage,
    unescapeHL7,
    getQuantityOfSegments,
    getSegmentData,
    getInformationBySegmentType,
    getInformationBySegmentTypeAndIndex,
    removeMllpFraming,
    parseMshSegment
    };
