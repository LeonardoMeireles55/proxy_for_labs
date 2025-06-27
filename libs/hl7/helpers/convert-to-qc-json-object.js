const log = require('../../shared/logger')

/**
 * Parses HL7 date format to required date format
 */
const parseHL7Date = (hl7DateString) => {
    if (!hl7DateString) return new Date().toISOString().slice(0, 19).replace('T', ' ')

    const year = hl7DateString.substring(0, 4)
    const month = hl7DateString.substring(4, 6)
    const day = hl7DateString.substring(6, 8)
    const hour = hl7DateString.substring(8, 10) || '00'
    const minute = hl7DateString.substring(10, 12) || '00'
    const second = hl7DateString.substring(12, 14) || '00'

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Extracts QC level from results array
 */
const extractQcLevel = (results) => {
    const qcLevelResult = results.find(r => r.observationName == 'Qc Level')

    return parseLevel(qcLevelResult?.value) || 'unknown'
}

const parseLevel = (value) => {

    if (typeof value !== 'string') return null

    if (value.endsWith('L')) return "low"
    if (value.endsWith('M')) return "normal"
    if (value.endsWith('H')) return "high"

    return null;
  }

/**
 * Filters results to include only numeric values with units
 */
const filterNumericResults = (results) => {
    return results.filter(result => {
        const value = parseFloat(result.value)
        return !isNaN(value) && result.unit && result.observationName
    })
}

/**
 * Calculates mean and standard deviation from reference range
 */
const calculateStatistics = (value, referenceRange) => {

    if (!referenceRange) return { mean: value, sd: value }

    const rangeParts = referenceRange.split('-')
    if (rangeParts.length === 2) {
        const min = parseFloat(rangeParts[0])
        const max = parseFloat(rangeParts[1])

        if (!isNaN(min) && !isNaN(max)) {
            const mean = (min + max) / 2
            const sd = (max - min) / 6 // Assuming 3 sigma range
            return { mean, sd }
        }
    }

    return { mean: value, sd: value }
}

/**
 * Transforms single result to AnalyticsDTO format
 */
const transformResult = (result, hl7Data, qcLevel) => {
    const value = parseFloat(result.value)
    const { mean, sd } = calculateStatistics(value, result.referenceRange)
    const date = parseHL7Date(hl7Data.order?.observationDateTime)

    return {
        date,
        level_lot: hl7Data.patient?.patientIdentifierList || 'DEFAULT_LOT',
        name: result.observationName,
        level: qcLevel,
        value,
        mean,
        sd,
        unit_value: result.unit
    }
}

/**
 * Converts HL7 lab data to Analytics DTO format
 */
const extractAndConvertToJsonObject = (hl7Data) => {

    if (hl7Data.messageControlId !== 'Q') {
        log.warn('Is not a control quality message, skipping conversion')
        return null
    }

    try {
        if (!hl7Data.results || !Array.isArray(hl7Data.results)) {
            log.warn('No results found in HL7 data')
            return null
        }

        const qcLevel = extractQcLevel(hl7Data.results)
        const numericResults = filterNumericResults(hl7Data.results)

        return numericResults.map(result => transformResult(result, hl7Data, qcLevel))

    } catch (error) {
        log.error('Error converting to Analytics DTO:', error)
        return null
    }
}

module.exports = {
    extractAndConvertToJsonObject,
    parseHL7Date,
    extractQcLevel
}
