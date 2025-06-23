const asciiBuffers = {
        SOH: 0x01, // Start of Header
        STX: 0x02, // Start of Text (ASTM: início de frame de dados)
        ETX: 0x03, // End of Text (ASTM: fim de frame com checksum)
        EOT: 0x04, // End of Transmission (ASTM: fim da transmissão)
        ENQ: 0x05, // Enquiry (ASTM: handshake para iniciar comunicação)
        ACK: 0x06, // Acknowledge (ASTM: confirmação positiva)
        BEL: 0x07, // Bell (geralmente não usado nos protocolos)
        BS: 0x08, // Backspace
        HT: 0x09, // Horizontal Tab
        LF: 0x0A, // Line Feed (pouco usado; HL7 ignora, ASTM pode usar)
        VT: 0x0B, // Vertical Tab (HL7: início de bloco <SB>)
        FF: 0x0C, // Form Feed
        CR: 0x0D, // Carriage Return (HL7: fim de segmento, ASTM: fim de frame)
        DLE: 0x10, // Data Link Escape
        DC1: 0x11, // Device Control 1
        DC2: 0x12, // Device Control 2
        DC3: 0x13, // Device Control 3
        DC4: 0x14, // Device Control 4
        NAK: 0x15, // Negative Acknowledge (ASTM: confirmação de erro)
        SYN: 0x16, // Synchronous Idle
        ETB: 0x17, // End of Transmission Block (ASTM: continuação de mensagem longa)
        CAN: 0x18, // Cancel
        EM: 0x19, // End of Medium
        SUB: 0x1A, // Substitute
        ESC: 0x1B, // Escape
        FS: 0x1C, // File Separator (HL7: fim de bloco <EB>)
        GS: 0x1D, // Group Separator
        RS: 0x1E, // Record Separator
        US: 0x1F  // Unit Separator
}


const hl7Framing = {
        START_BLOCK: asciiBuffers.VT,
        END_BLOCK: asciiBuffers.FS,
        SEGMENT_SEPARATOR: asciiBuffers.CR
}

const astmFraming = {
        START_FRAME: asciiBuffers.STX,
        END_FRAME: asciiBuffers.ETX,
        END_TRANSMISSION: asciiBuffers.EOT,
        HANDSHAKE_ENQ: asciiBuffers.ENQ,
        HANDSHAKE_ACK: asciiBuffers.ACK,
        HANDSHAKE_NAK: asciiBuffers.NAK,
        FRAME_END: asciiBuffers.CR,
        MULTIPART_END: asciiBuffers.ETB
    };



module.exports = { asciiBuffers, hl7Framing, astmFraming };
