const fs = require('node:fs')
const log = require('../utils/logger')
const hl7 = require('hl7parser')

const parseHl7Message = (data) => {
    const message = hl7.create(data.toString('utf8'))

    log.info(message.get('MSH.7').toString()) // Log the message type

    return message
}

parseHl7Message('MSH|-¥&|cpure||host||20160724080600+0200||OML^O34^OML_O42|1236|P|2.5.1|||||UNICODE UTF-8|||LAB-28R^ROCHE<CR>MSA|AA|1236<CR><FS><CR>')

const extractLabValues = (parsedMessage) => {
    const labResults = []

    try {
        const lines = parsedMessage._text.split('\r\n')

        lines.forEach((line, index) => {
            if (line.startsWith('OBX|')) {
                const fields = line.split('|')

                if (fields.length >= 7) {                    const observationId = fields[1] // Set ID
                    const valueType = fields[2] // Value Type (NM = Numeric)
                    const observationIdentifier = fields[3] // Observation Identifier
                    const observationValue = fields[5] // Observation Value
                    const units = fields[6] // Units
                    const referenceRange = fields[7] // Reference Range
                    const abnormalFlags = fields[8] // Abnormal Flags

                    const identifierParts = observationIdentifier.split('^')
                    const testName = identifierParts[1] || identifierParts[0]
                    const testCode = identifierParts[0]

                    const labResult = {
                        observationId,
                        testCode,
                        testName,
                        value: observationValue,
                        units,
                        referenceRange,
                        abnormalFlags,
                        status: getResultStatus(abnormalFlags),
                        valueType
                    }

                    labResults.push(labResult)
                }
            }
        })

        return labResults

    } catch (error) {
        log.error('Error extracting lab values:', error)
        return []
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

const extractPatientInfo = (parsedMessage) => {
    try {
        const lines = parsedMessage._text.split('\r\n')

        for (const line of lines) {
            if (line.startsWith('PID|')) {
                const fields = line.split('|')

                const patientName = fields[5] // Patient Name
                const dateOfBirth = fields[7] // Date of Birth
                const sex = fields[8] // Sex
                const patientId = fields[3] // Patient ID

                // Parse patient name
                const nameParts = patientName ? patientName.split('^') : []

                return {
                    patientId,
                    lastName: nameParts[0] || '',
                    firstName: nameParts[1] || '',
                    middleName: nameParts[2] || '',
                    dateOfBirth,
                    sex
                }
            }
        }

        return null
    } catch (error) {
        log.error('Error extracting patient info:', error)
        return null
    }
}

const generateLabReport = (parsedMessage) => {
    const patientInfo = extractPatientInfo(parsedMessage)
    const labValues = extractLabValues(parsedMessage)

    return {
        patient: patientInfo,
        labResults: labValues,
        totalTests: labValues.length,
        abnormalResults: labValues.filter(result => result.status !== 'Normal').length
    }
}

const loadHl7Example = () => {
    fs.readFile('./protocols/example.hl7', (err, data) => {
        if (err) {
            log.error('Error reading HL7 example file:', err.message)
            return
        }

        try {
            const parsedMessage = parseHl7Message(data)

            log.info('HL7 Example File Loaded Successfully')

            const labReport = generateLabReport(parsedMessage)

            log.info('=== LABORATORY REPORT ===')

            if (labReport.patient) {
                log.info('Patient Information:')
                log.info(`  Name: ${labReport.patient.firstName} ${labReport.patient.lastName}`)
                log.info(`  ID: ${labReport.patient.patientId}`)
                log.info(`  Date of Birth: ${labReport.patient.dateOfBirth}`)
                log.info(`  Sex: ${labReport.patient.sex}`)
                log.info('')
            }

            log.info(`Total Tests: ${labReport.totalTests}`)
            log.info(`Abnormal Results: ${labReport.abnormalResults}`)
            log.info('')

            log.info('Test Results:')
            labReport.labResults.forEach((result, index) => {
                log.info(`${index + 1}. ${result.testName}`)
                log.info(`   Value: ${result.value} ${result.units}`)
                log.info(`   Reference Range: ${result.referenceRange}`)
                log.info(`   Status: ${result.status}`)
                log.info('')
            })

        } catch (parseError) {
            log.error('Error parsing HL7 message:', parseError)
        }
    })
}

// Export the parser functions and utilities
module.exports = {
    parseHl7Message,
    loadHl7Example,
    extractLabValues,
    extractPatientInfo,
    generateLabReport
}
