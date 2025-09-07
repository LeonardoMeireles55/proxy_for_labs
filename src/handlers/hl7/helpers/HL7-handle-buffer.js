const { HL7_FRAMING } = require('../../utils/buffers');
const { processHL7Message } = require('./HL7-message-handler')

let allocatedBuffer = Buffer.alloc(0);

const handleBuffer = (buffer, socket) => {
  if (buffer && buffer.length > 0) {
    allocatedBuffer = Buffer.concat([allocatedBuffer, buffer]);
  }

  while (true) {
     let endIndex = allocatedBuffer.indexOf(HL7_FRAMING.END_BLOCK);

    if (endIndex == -1) {
      endIndex = allocatedBuffer.indexOf(HL7_FRAMING.END_BLOCK_CR);

      if (endIndex == -1) {
      break;
    }

    const completeMessage = allocatedBuffer.subarray(
      0,
      endIndex + HL7_FRAMING.END_BLOCK.length
    );

    allocatedBuffer = allocatedBuffer.subarray(
      endIndex + HL7_FRAMING.END_BLOCK.length
    );

    processHL7Message(completeMessage, socket);
  }
};
}
module.exports = { handleBuffer };
