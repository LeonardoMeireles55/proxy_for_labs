const { HL7_FRAMING } = require('../../utils/buffers');
const { processHL7Message } = require('./HL7-message-handler')

const handleBuffer = (buffer, socket) => {

    processHL7Message(buffer, socket);
  }

module.exports = { handleBuffer };
