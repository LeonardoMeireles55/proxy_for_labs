# Laboratory Equipment Proxy System

A comprehensive Node.js-based proxy system for laboratory equipment communication, supporting HL7 v2.x and ASTM protocols with real-time message processing and data transformation capabilities.

## Overview

This system acts as an intelligent proxy between laboratory equipment and Laboratory Information Systems (LIS), handling multiple communication protocols, message parsing, acknowledgments, and data transformation for quality control and result reporting.

### Key Features

- **Multi-Protocol Support**: HL7 v2.x and ASTM protocol handling
- **Real-Time Processing**: TCP/IP socket-based communication with live message processing
- **Message Transformation**: Automatic conversion from protocol messages to structured JSON
- **Quality Control**: Specialized QC data extraction and processing
- **Equipment Simulation**: Built-in mock equipment for testing and development
- **Proxy Architecture**: Forward and reverse proxy implementations
- **Comprehensive Logging**: Detailed logging with configurable levels
- **Error Handling**: Robust error handling with proper acknowledgments

## Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Laboratory    │    │     Proxy       │    │      LIS        │
│   Equipment     │◄──►│     System      │◄──►│    Server       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    HL7/ASTM              Message Processing        JSON/REST API
    TCP Sockets           & Transformation          Integration
```

### Core Components

1. **Protocol Handlers** - Message parsing and generation for HL7 and ASTM
2. **Proxy Servers** - Forward and reverse proxy implementations
3. **Data Extractors** - Structured data extraction from protocol messages
4. **Mock Equipment** - Simulated laboratory equipment for testing
5. **API Integration** - External system integration for data forwarding

## Quick Start

### Prerequisites

- Node.js v12+
- Network access for TCP socket communication
- Basic understanding of laboratory protocols (HL7/ASTM)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd proxy_for_labs

# Install dependencies
npm install

# Configure the system (optional)
cp configs/config.js.example configs/config.js
```

### Running Examples

```bash
# View parsing examples
node examples.js

# Start test environment with mock equipment
node start-emu-environment.js

# Run the main proxy application
node app.js
```

## Protocol Support

### HL7 v2.x Messages

- **ORU^R01** - Observation Result (Unsolicited)
- **ORM^O01** - Order Message
- **QBP^Q11** - Query by Parameter
- **ACK** - General Acknowledgment

### Supported HL7 Segments

| Segment | Purpose | Implementation |
|---------|---------|----------------|
| MSH | Message Header | ✅ Full support |
| PID | Patient Identification | ✅ Full support |
| OBR | Observation Request | ✅ Full support |
| OBX | Observation Result | ✅ Full support |
| SPM | Specimen | ✅ Full support |
| EQU | Equipment Detail | ✅ Full support |
| ECD | Equipment Command | ✅ Full support |
| INV | Inventory Detail | ✅ Full support |
| NTE | Notes and Comments | ✅ Basic support |
| MSA | Message Acknowledgment | ✅ Full support |

### ASTM Protocol

- **Control Messages** - ENQ, ACK, NAK, EOT
- **Data Messages** - Header, Patient, Order, Results
- **Framing** - STX/ETX with checksum validation

## Configuration

### Basic Setup

```javascript
// configs/config.js
module.exports = {
  proxyHost: 'localhost',
  proxyPort: 3000,
  lisHost: 'localhost',
  lisPort: 3001,
  debug: true,
  logLevel: 'debug'
};
```

### Logging Configuration

```javascript
// configs/logger.js
const winston = require('winston');

module.exports = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'proxy.log' })
  ]
});
```

## Usage Examples

### Parsing HL7 Messages

```javascript
const { HL7toJson, extractHl7Data } = require('./src/handlers/hl7');

// Parse message to JSON structure
const jsonData = HL7toJson(messageBuffer);

// Extract structured data with all segments
const structuredData = extractHl7Data(messageBuffer);
console.log('Patient:', structuredData.patient);
console.log('Results:', structuredData.results);
```

### Creating Acknowledgments

```javascript
const { createAcknowledgment } = require('./src/handlers/hl7');

const ackMessage = createAcknowledgment(
  'AA',      // Acknowledgment code
  'MSG001',  // Message control ID
  'P',       // Processing ID
  '2.5.1',   // HL7 version
  'R01'      // Trigger event
);
```

### ASTM Message Processing

```javascript
const { parseAstmMessage } = require('./src/handlers/astm');

const parsed = parseAstmMessage(astmBuffer);
console.log('Message type:', parsed.type);
console.log('Segments:', parsed.segments);
```

## Testing & Development

### Mock Equipment

The system includes sophisticated mock equipment for testing:

```javascript
// HL7 Equipment Mock
const { createEquipmentServerHL7 } = require('./src/mocks/hl-7/equipment-server-hl7');
const server = createEquipmentServerHL7();

// ASTM Equipment Mock
const { createEquipmentServerASTM } = require('./src/mocks/astm/equipment-server-astm');
const astmServer = createEquipmentServerASTM();
```

### Sample Messages

Pre-built sample messages for testing:

```javascript
const { createSampleMessages } = require('./src/handlers/hl7');
const samples = createSampleMessages();

// Access different message types
console.log(samples.oru_r01); // Lab results
console.log(samples.orm_o01); // Orders
```

## Monitoring & Debugging

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* node app.js
```

### Message Inspection

```javascript
const { writeDebugFile } = require('./src/shared/save-data-to-file');

// Save parsed data for inspection
writeDebugFile(JSON.stringify(parsedData, null, 2), 'debug-output');
```

### Buffer Analysis

```javascript
// View raw message bytes
console.log('Hex:', buffer.toString('hex'));
console.log('UTF-8:', buffer.toString('utf8'));
```

## Security Considerations

- **Input Validation**: All incoming messages are validated before processing
- **Error Handling**: Secure error responses without information leakage
- **Network Security**: TCP socket connections with proper timeout handling
- **Data Sanitization**: Special character escaping and validation

## Performance

### Optimizations

- **Buffer Pooling**: Efficient memory management for message buffers
- **Async Processing**: Non-blocking message processing
- **Connection Reuse**: TCP connection pooling for better performance
- **Selective Parsing**: Parse only required message segments

### Monitoring

- Message processing latency tracking
- Connection health monitoring
- Memory usage optimization
- Error rate monitoring

## API Integration

### Quality Control Data

```javascript
const { extractQcValuesAndConvertToJson } = require('./src/handlers/hl7');

// Process and forward QC data
const qcData = extractQcValuesAndConvertToJson(messageData);
```

### External System Integration

```javascript
const { postQualityControlData } = require('./src/api/send-cq-data');

// Send data to external system
await postQualityControlData(processedData);
```

## Documentation

- **[HL7 Implementation Guide](docs/hl7-guide.md)** - Comprehensive HL7 v2.x reference
- **API Documentation** - Available in source code JSDoc comments

## Contributing

We welcome contributions!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

### Common Issues

- **Connection Timeouts**: Check network configuration and firewall settings
- **Message Parsing Errors**: Validate message format and encoding
- **Missing Segments**: Verify equipment message configuration

### Getting Help

- Check the troubleshooting section in [hl7-guide.md](docs/hl7-guide.md)
- Review examples in `examples.js`
- Examine mock equipment implementations
- Open an issue for specific problems

## Version History

- **v1.0.0** - Initial release with HL7 support
- **Future** - Enhanced protocol support to ASTM and improvements

---

**Note**: This system is designed for laboratory environments and should be properly validated before production use. Always follow your organization's protocols for medical device integration and data handling.
