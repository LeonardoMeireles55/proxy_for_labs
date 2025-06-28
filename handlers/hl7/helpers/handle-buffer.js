const { HL7_FRAMING } = require('../../../shared/buffers')
const { processHL7Message } = require('./hl7-message-handle')

let allocatedBuffer = Buffer.alloc(0);

const handleBuffer = (buffer, clientSocket) => {


    if (buffer && buffer.length > 0) {
        allocatedBuffer = Buffer.concat([allocatedBuffer, buffer]);
    }

    const endIndex = allocatedBuffer.indexOf(HL7_FRAMING.END_BLOCK)

    // Process complete messages
    if (endIndex !== -1) {
        const completeMessage = allocatedBuffer.subarray(0, endIndex + HL7_FRAMING.END_BLOCK.length)

        allocatedBuffer = allocatedBuffer.subarray(endIndex + HL7_FRAMING.END_BLOCK.length)


        processHL7Message(completeMessage, clientSocket)
    }
}

module.exports = { handleBuffer }
