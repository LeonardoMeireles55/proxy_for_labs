const hl7Buffers = {
        SOH: 0x01,
        STX: 0x02,
        ETX: 0x03,
        EOT: 0x04,
        ENQ: 0x05,
        ACK: 0x06,
        LF: 0x0A,
        DLE: 0x10,
        DC1: 0x11,
        DC2: 0x12,
        DC3: 0x13,
        DC4: 0x14,
        NAK: 0x15,
        SYN: 0x16,
        ETB: 0x17
}

module.exports = hl7Buffers;
