# HL7 v2.x Implementation Guide for Laboratory Proxy

This guide provides comprehensive information for developers working with HL7 v2.x messages in the laboratory proxy system. It covers message structure, segment types, implementation examples, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [HL7 Message Structure](#hl7-message-structure)
3. [Common Segments Reference](#common-segments-reference)
4. [Implementation Examples](#implementation-examples)
5. [Project Integration](#project-integration)
6. [Troubleshooting](#troubleshooting)

## Overview

HL7 (Health Level 7) is a standard for exchanging information between medical applications. This proxy system handles laboratory equipment communication using HL7 v2.x messages with MLLP (Minimal Lower Layer Protocol) framing.

### Key Features

- Real-time message parsing and routing
- Automatic acknowledgment generation
- Support for multiple laboratory message types
- JSON conversion for data processing
- Quality control data extraction

## Common Segments Reference

Below is a comprehensive list of HL7 segments used in laboratory messaging, with their purpose and typical usage patterns.

### Core Message Segments

| Segment | Name                   | Purpose                                                         | Usage in Lab             |
| ------- | ---------------------- | --------------------------------------------------------------- | ------------------------ |
| **MSH** | Message Header         | Defines message metadata, sender, receiver, timestamp           | Required in all messages |
| **PID** | Patient Identification | Patient demographic data (ID, name, DOB, sex, etc.)             | Patient context          |
| **ORC** | Common Order           | General order control data (order status, date/time, placer ID) | Order management         |
| **OBR** | Observation Request    | Request details for diagnostic service or lab test              | Test ordering            |
| **OBX** | Observation Result     | Actual test results (numeric, textual, coded)                   | Results reporting        |
| **NTE** | Notes and Comments     | Free-text comments related to previous segments                 | Additional info          |

### Laboratory-Specific Segments

| Segment | Name               | Purpose                                           | Lab Context          |
| ------- | ------------------ | ------------------------------------------------- | -------------------- |
| **SPM** | Specimen           | Specimen information (type, collection, handling) | Specimen tracking    |
| **SAC** | Specimen Container | Container details and specimen handling           | Container management |
| **EQU** | Equipment Detail   | Equipment status and configuration                | Equipment monitoring |
| **ECD** | Equipment Command  | Equipment control commands and parameters         | Equipment control    |
| **INV** | Inventory Detail   | Reagent and supply inventory information          | Inventory management |
| **TCD** | Test Code Detail   | Test configuration and parameters                 | Test setup           |

### Supporting Segments

| Segment | Name                       | Purpose                                      | When Used         |
| ------- | -------------------------- | -------------------------------------------- | ----------------- |
| **MSA** | Message Acknowledgment     | Acknowledgment response to received messages | Response messages |
| **QPD** | Query Parameter Definition | Query parameters for information requests    | Query messages    |
| **RCP** | Response Control Parameter | Response control for query responses         | Query responses   |
| **ERR** | Error                      | Error information and details                | Error reporting   |
| **TQ1** | Timing/Quantity            | Timing and quantity specifications           | Scheduling        |

### Administrative Segments

| Segment | Name                  | Purpose                                                      | Context           |
| ------- | --------------------- | ------------------------------------------------------------ | ----------------- |
| **PV1** | Patient Visit         | Visit information (location, attending physician, admission) | Visit context     |
| **AL1** | Allergy Information   | Patient allergy data                                         | Safety info       |
| **DG1** | Diagnosis             | Clinical diagnosis information                               | Clinical context  |
| **IN1** | Insurance             | Insurance policy and coverage details                        | Billing           |
| **GT1** | Guarantor             | Information about the person responsible for the bill        | Financial         |
| **NK1** | Next of Kin           | Contact information for next of kin or emergency contact     | Emergency contact |
| **FT1** | Financial Transaction | Billing or financial transaction records                     | Billing           |
| **Zxx** | Custom Segment        | Institution-defined segment (non-standard/custom)            | Custom data       |

> 💡 **Note:** Segment availability and usage vary by message type (ADT, ORU, ORM, SIU). Always refer to the specific HL7 chapter and your laboratory system documentation.

## HL7 Message Structure

HL7 messages use MLLP (Minimal Lower Layer Protocol) framing and follow a specific byte structure for reliable transmission over TCP/IP networks.

### MLLP Framing

- **Start Block**: `<VT>` (0x0B) - Vertical Tab character
- **Segment Separator**: `<CR>` (0x0D) - Carriage Return character
- **End Block**: `<FS><CR>` (0x1C 0x0D) - File Separator + Carriage Return

### Message Format Structure

```text
<VT>MSH|^~\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20231201120000||ORU^R01^ORU_R01|MSG001|P|2.5<CR>
PID|1||PATIENT001||DOE^JOHN^||19900101|M<CR>
OBR|1|ORDER001||^^^GLU|||20231201120000<CR>
OBX|1|NM|GLU^Glucose||95|mg/dL|70-105|N<CR>
<FS><CR>
```

### Character Encoding Rules

HL7 uses specific encoding characters for field separation and escaping:

| Character              | Purpose                             | Escape Sequence | Default |
| ---------------------- | ----------------------------------- | --------------- | ------- |
| Field separator        | Separates fields within a segment   | `\F\`           | `\|`    |
| Component separator    | Separates components within a field | `\S\`           | `^`     |
| Subcomponent separator | Separates subcomponents             | `\T\`           | `&`     |
| Repetition separator   | Separates repeated values           | `\R\`           | `~`     |
| Escape character       | Escapes special characters          | `\E\`           | `\`     |

### Message Types in Laboratory Context

| Type    | Code | Purpose                          | Example Use Case         |
| ------- | ---- | -------------------------------- | ------------------------ |
| **ORU** | R01  | Observation Result (Unsolicited) | Lab results reporting    |
| **ORM** | O01  | Order Message                    | Test ordering            |
| **QBP** | Q11  | Query by Parameter               | Equipment status queries |
| **ACK** | ---  | General Acknowledgment           | Message confirmation     |
| **QCK** | Q02  | Query General Acknowledgment     | Query responses          |

## Implementation Examples

### 1. Parsing HL7 Messages

```javascript
const { HL7toJson, retrieveHl7MessageData } = require('./src/handlers/hl7');

// Parse raw HL7 message to JSON structure
const jsonData = HL7toJson(rawMessageBuffer);
console.log('Patient ID:', jsonData.PID[0].split('|')[3]);

// Extract structured data with all segments
const structuredData = retrieveHl7MessageData(rawMessageBuffer);
console.log('Patient Info:', structuredData.patient);
console.log('Lab Results:', structuredData.results);

const segment = getInformationBySegmentTypeAndIndex(
  rawHL7MessageBuffer,
  'MSH',
  5
);

log.debug(`Segment MSH.5 -> ${segment}`);
```

### 2. Creating HL7 Acknowledgments

```javascript
const {
  createAcknowledgment,
  sendHL7Acknowledgment
} = require('./src/handlers/hl7');

// Create acknowledgment for received message
const ackMessage = createAcknowledgment(
  'AA', // Accept acknowledgment
  'MSG001', // Original message control ID
  'P', // Production environment
  '2.5.1', // HL7 version
  'R01' // Trigger event
);

// Send acknowledgment to client
sendHL7Acknowledgment(originalMessage, clientSocket);
```

### 3. Working with Specific Segments

```javascript
const { getInformationBySegmentTypeAndIndex } = require('./src/handlers/hl7');

// Extract specific field from any segment
const patientName = getInformationBySegmentTypeAndIndex(message, 'PID', 5);
const testCode = getInformationBySegmentTypeAndIndex(message, 'OBR', 4);
const resultValue = getInformationBySegmentTypeAndIndex(message, 'OBX', 5);

console.log(
  `Patient: ${patientName}, Test: ${testCode}, Result: ${resultValue}`
);
```

### 4. Quality Control Data Processing

```javascript
const { extractQcValuesAndConvertToJson } = require('./src/handlers/hl7');

// Process QC data and send to external system
const qcData = extractQcValuesAndConvertToJson(structuredData);
```

## Project Integration

### File Structure for HL7 Handling

```text
src/handlers/hl7/
├── index.js                    # Main exports
├── helpers/
│   ├── parser.js              # Core parsing functions
│   ├── hl7-acknowledgment.js  # ACK message handling
│   ├── handle-buffer.js       # Buffer management
│   ├── mappers.js             # Data transformation
│   └── convert-to-qc-json.js  # QC data processing
└── segments/
    ├── header.js              # MSH segment processing
    ├── patient.js             # PID segment processing
    ├── order.js               # OBR segment processing
    ├── results.js             # OBX segment processing
    ├── specimen.js            # SPM segment processing
    ├── equipment.js           # EQU/ECD segment processing
    └── inventory.js           # INV segment processing
```

### Adding New Segment Support

1. **Create segment processor** in `src/handlers/hl7/segments/`:

```javascript
// src/handlers/hl7/segments/new-segment.js
const {
  getInformationBySegmentTypeAndIndex
} = require('../helpers/hl7-parsers');
const { cleanObject } = require('../helpers/HL7-mappers');

const extractNewSegmentInfo = (message) => {
  return cleanObject({
    field1: getInformationBySegmentTypeAndIndex(message, 'NSG', 1),
    field2: getInformationBySegmentTypeAndIndex(message, 'NSG', 2)
    // Add more fields as needed
  });
};

module.exports = { extractNewSegmentInfo };
```

1. **Update main data extractor** in `src/handlers/hl7/helpers/hl7-data-extract.js`:

```javascript
const { extractNewSegmentInfo } = require('../segments/new-segment');

// Add to retrieveHl7MessageData function
const newSegmentInfo = extractNewSegmentInfo(message);

const data = cleanObject({
  // ...existing segments...
  ...(Object.keys(newSegmentInfo).length && { newSegment: newSegmentInfo })
});
```

### Error Handling Best Practices

```javascript
try {
  const parsedData = retrieveHl7MessageData(rawMessage);

  // Validate required fields
  if (!parsedData.messageHeader?.messageControlId) {
    throw new Error('Missing message control ID');
  }

  // Process data
  await processLabResults(parsedData);
} catch (error) {
  log.error('HL7 processing failed:', error);

  // Send negative acknowledgment
  const nackMessage = createAcknowledgment('AR', messageControlId);
  socket.write(nackMessage);
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. MLLP Framing Errors

**Problem**: Messages not parsing correctly

```text
Error: Invalid MLLP framing
```

**Solution**: Check for proper start/end characters

```javascript
const { isValidMessage } = require('./src/handlers/hl7');

if (!isValidMessage(buffer)) {
  log.error('Invalid MLLP framing detected');
  // Handle malformed message
}
```

#### 2. Character Encoding Issues

**Problem**: Special characters appearing incorrectly

```text
Field contains: Smith\S\John instead of Smith^John
```

**Solution**: Use unescaping function

```javascript
const { unescapeHL7 } = require('./src/handlers/hl7');
const cleanText = unescapeHL7(rawFieldValue);
```

#### 3. Missing Segments

**Problem**: Expected segment not found

```javascript
// This returns null if segment doesn't exist
const missingData = getInformationBySegmentTypeAndIndex(message, 'SPM', 1);
```

**Solution**: Add validation and defaults

```javascript
const specimenId =
  getInformationBySegmentTypeAndIndex(message, 'SPM', 1) || 'UNKNOWN';
```

### Debug Tools

#### 1. Message Inspection

```javascript
const { parseRawHL7ToString } = require('./src/handlers/hl7');

// View individual segments
const segments = parseRawHL7ToString(buffer);
segments.forEach((segment, index) => {
  console.log(`Segment ${index}:`, segment);
});
```

#### 2. Buffer Analysis

```javascript
// View raw bytes for debugging
console.log('Raw hex:', buffer.toString('hex'));
console.log('Raw UTF-8:', buffer.toString('utf8'));
```

#### 3. Structured Data Validation

```javascript
const { writeDebugFile } = require('./src/shared/save-data-to-file');

// Save parsed data for inspection
writeDebugFile(JSON.stringify(parsedData, null, 2), 'debug-hl7-data');
```

### Testing HL7 Implementation

#### 1. Unit Tests Example

```javascript
// test/hl7-parser.test.js
const { HL7toJson } = require('../src/handlers/hl7');

describe('HL7 Parser', () => {
  test('should parse MSH segment correctly', () => {
    const testMessage = Buffer.from('\x0bMSH|^~\\&|LAB|FACILITY\x1c\x0d');
    const result = HL7toJson(testMessage);

    expect(result.MSH).toBeDefined();
    expect(result.MSH[0]).toContain('LAB');
  });
});
```

#### 2. Integration Tests

```javascript
// test/integration/hl7-flow.test.js
const {
  createEquipmentServerHL7
} = require('../src/mocks/hl-7/equipment-server-hl7');

describe('HL7 Message Flow', () => {
  test('should handle complete message cycle', async () => {
    const server = createEquipmentServerHL7();
    // Test message sending, acknowledgment, etc.
  });
});
```

### Performance Considerations

1. **Buffer Management**: Use efficient buffer concatenation for incomplete messages
2. **Memory Usage**: Process large result sets in chunks
3. **Connection Pooling**: Reuse TCP connections for multiple messages
4. **Async Processing**: Handle acknowledgments asynchronously

### Security Considerations

1. **Input Validation**: Always validate message structure before processing
2. **Data Sanitization**: Escape or remove potentially harmful characters
3. **Access Control**: Implement proper authentication for HL7 endpoints
4. **Audit Logging**: Log all message transactions for compliance

---

## Reference Resources

- [HL7 v2.5.1 Standard Documentation](http://www.hl7.org/)
- [MLLP Protocol Specification](http://www.hl7.org/implement/standards/product_brief.cfm?product_id=55)
- [Laboratory Data Exchange Standards](https://www.hl7.org/Special/committees/lab/index.cfm)

## Contributing

When contributing to HL7 functionality:

1. Follow existing code patterns in `/src/handlers/hl7/`
2. Add comprehensive tests for new segments
3. Update this documentation with new features
4. Ensure backward compatibility with existing messages
5. Validate against real laboratory equipment when possible

---

Last updated: June 2025
