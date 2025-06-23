/**
 * @fileoverview ASCII Control Character Constants and Protocol Framing Utilities
 * This module provides comprehensive constants for ASCII control characters
 * and protocol-specific framing constants for HL7 and ASTM communication protocols.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

/**
 * ASCII control character constants used in medical device communication protocols
 * These characters are fundamental to ASTM and HL7 protocol implementations
 *
 * @typedef {Object} ASCIIBuffers
 * @property {number} SOH - Start of Header (0x01)
 * @property {number} STX - Start of Text (0x02) - ASTM: início de frame de dados
 * @property {number} ETX - End of Text (0x03) - ASTM: fim de frame com checksum
 * @property {number} EOT - End of Transmission (0x04) - ASTM: fim da transmissão
 * @property {number} ENQ - Enquiry (0x05) - ASTM: handshake para iniciar comunicação
 * @property {number} ACK - Acknowledge (0x06) - ASTM: confirmação positiva
 * @property {number} BEL - Bell (0x07) - geralmente não usado nos protocolos
 * @property {number} BS - Backspace (0x08)
 * @property {number} HT - Horizontal Tab (0x09)
 * @property {number} LF - Line Feed (0x0A) - pouco usado; HL7 ignora, ASTM pode usar
 * @property {number} VT - Vertical Tab (0x0B) - HL7: início de bloco <SB>
 * @property {number} FF - Form Feed (0x0C)
 * @property {number} CR - Carriage Return (0x0D) - HL7: fim de segmento, ASTM: fim de frame
 * @property {number} DLE - Data Link Escape (0x10)
 * @property {number} DC1 - Device Control 1 (0x11)
 * @property {number} DC2 - Device Control 2 (0x12)
 * @property {number} DC3 - Device Control 3 (0x13)
 * @property {number} DC4 - Device Control 4 (0x14)
 * @property {number} NAK - Negative Acknowledge (0x15) - ASTM: confirmação de erro
 * @property {number} SYN - Synchronous Idle (0x16)
 * @property {number} ETB - End of Transmission Block (0x17) - ASTM: continuação de mensagem longa
 * @property {number} CAN - Cancel (0x18)
 * @property {number} EM - End of Medium (0x19)
 * @property {number} SUB - Substitute (0x1A)
 * @property {number} ESC - Escape (0x1B)
 * @property {number} FS - File Separator (0x1C) - HL7: fim de bloco <EB>
 * @property {number} GS - Group Separator (0x1D)
 * @property {number} RS - Record Separator (0x1E)
 * @property {number} US - Unit Separator (0x1F)
 */
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

/**
 * HL7 protocol framing constants
 * Used for HL7 message structure and block delimitation
 *
 * @typedef {Object} HL7Framing
 * @property {number} START_BLOCK - Vertical Tab (0x0B) - início de bloco
 * @property {number} END_BLOCK - File Separator (0x1C) - fim de bloco
 * @property {number} SEGMENT_SEPARATOR - Carriage Return (0x0D) - separador de segmentos
 */
const hl7Framing = {
        START_BLOCK: asciiBuffers.VT,
        END_BLOCK: asciiBuffers.FS,
        SEGMENT_SEPARATOR: asciiBuffers.CR
}

/**
 * ASTM protocol framing constants
 * Used for ASTM message structure, handshaking, and frame delimitation
 *
 * @typedef {Object} ASTMFraming
 * @property {number} START_FRAME - Start of Text (0x02) - início de frame de dados
 * @property {number} END_FRAME - End of Text (0x03) - fim de frame com checksum
 * @property {number} END_TRANSMISSION - End of Transmission (0x04) - fim da transmissão
 * @property {number} HANDSHAKE_ENQ - Enquiry (0x05) - handshake para iniciar comunicação
 * @property {number} HANDSHAKE_ACK - Acknowledge (0x06) - confirmação positiva
 * @property {number} HANDSHAKE_NAK - Negative Acknowledge (0x15) - confirmação de erro
 * @property {number} FRAME_END - Carriage Return (0x0D) - fim de frame
 * @property {number} MULTIPART_END - End of Transmission Block (0x17) - continuação de mensagem longa
 */
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
