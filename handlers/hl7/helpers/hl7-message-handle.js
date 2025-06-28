const log = require("../../../shared/logger")
const net = require("node:net")
const { extractCompleteHL7Data } = require("..")
const { saveDataToFile } = require("../../../shared/save-data-to-file")
const { extractAndConvertToJsonObject } = require("./convert-to-qc-json-object")

/**
 * Process complete HL7 message and send acknowledgment
 * @param {Buffer} message - Complete HL7 message with MLLP framing
 * @param {net.Socket} clientSocket - Client socket for sending acknowledgment
 */
const processHL7Message = (message, clientSocket) => {
    log.debug('Processing complete HL7 message')


    // Extract and process HL7 data
    const extractedData = extractCompleteHL7Data(message)

    const analyticsData = extractAndConvertToJsonObject(extractedData)

    // Save extracted HL7 data
    if (extractedData) {
        saveDataToFile(JSON.stringify(extractedData, null, 2))
    } else {
        log.warn('No valid HL7 data extracted from message')
        return
    }

    clientSocket.write(message)

    // Save analytics data
    if (analyticsData) {
        saveDataToFile(JSON.stringify(analyticsData, null, 2))
    } else {
        log.warn('No valid analytics data extracted from HL7 message')
    }


    log.debug('HL7 message processed successfully')
  }


module.exports = { processHL7Message }
