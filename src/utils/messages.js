const { HL7Message } =  require('hl7v2')


const createHl7Message = (message) => {
  try {
    return new HL7Message(message);
  } catch (error) {
    console.error('Error creating HL7 message:', error);
  }
}

const parseHL7Message = (message) => {
  try {
    const hl7Message = new HL7Message(message);
    return hl7Message.asHL7;
  } catch (error) {
    console.error('Error parsing HL7 message:', error);
    throw new Error('Invalid HL7 message format');
  }
}

const getMSH = (message) => {

  try {
    return createHl7Message(message)?.MSH;
  }
  catch (error) {
    console.error('Error converting HL7 message to JSON:', error);
    throw new Error('Failed to convert HL7 message to JSON');
  }
}


module.exports = { parseHL7Message,
                   createHl7Message,
                   getMSH
                 };
