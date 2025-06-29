const { getInformationBySegmentTypeAndIndex } = require('../helpers/parser')
const { cleanObject } = require('../helpers/mappers')

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

module.exports = { extractSpecimenInfo }
