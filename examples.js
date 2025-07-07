const {
  parseRawStringToHL7Buffer,
  parseRawHL7ToString,
  extractHl7Data,
  HL7toJson,
  getInformationBySegmentTypeAndIndex,
  getHL7ValueBySegmentTypeFieldComponentAndSubcomponent,
  HL7BufferToJson,
  extractQcValuesAndConvertToJsonCobas,
  parseMshSegment
} = require('./src/handlers/hl7');
const log = require('./configs/logger');
const { writeDebugFile } = require('./src/shared/save-data-to-file');

/* * Example HL7 message for testing
 * This is a sample HL7 message that can be used to test the parsing functions
 * It includes various segments like MSH, PID, OBR, OBX, NTE, and FT1
 * The message is formatted as a string with segments separated by carriage returns
 */
const cobasMock = [
  `
"MSH|^~\\&|cobas pure||Host||20250701193219+0900||OUL^R22^OUL_R22|159|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-29^IHE",
"SPM|1|20391&CONTROL||\"\"|||||||Q^^HL70369|||~~~~|||||20260430|||||PSCO^^99ROC|||SC^^99ROC",
"SAC|||20391^CONTROL|||||||704966|",
"INV|20391^PCCC1^99ROC|OK^^HL703843|CO^^HL70384|^^99ROC",
"OBR|1|\"\"||20340^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20340^20340^99ROC^^^IHELAW|1|9.02|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"OBX|2|CE|20340^20340^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"TCD|20340^^99ROC|^1^:^1",
"INV|2034001|OK^^HL70383~CURRENT^^99ROC|R1|51193|1|12||||||20260531||||861168",
"INV|2034001|OK^^HL70383~CURRENT^^99ROC|R3|51193|1|12||||||20260531||||861168",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191426|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|54|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|8.78|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|0.361|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192446||8||||||||RSLT",
"OBR|2|\"\"||20411^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20411^20411^99ROC^^^IHELAW|1|106|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"OBX|2|CE|20411^20411^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"TCD|20411^^99ROC|^1^:^1",
"INV|2041001|OK^^HL70383~CURRENT^^99ROC|R1|13474|1|11||||||20260131||||869385",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191434|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|55|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|106|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|5.41|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192454||9||||||||RSLT",
"OBR|3|\"\"||20420^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20420^20420^99ROC^^^IHELAW|1|151|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"OBX|2|CE|20420^20420^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"TCD|20420^^99ROC|^1^:^1",
"INV|2042001|OK^^HL70383~CURRENT^^99ROC|R1|40263|1|35||||||20251231||||865041",
"INV|2042001|OK^^HL70383~CURRENT^^99ROC|R3|40263|1|35||||||20251231||||865041",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191442|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|56|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|151|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|9.00|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192502||10||||||||RSLT",
"OBR|4|\"\"||20600^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20600^20600^99ROC^^^IHELAW|1|47.3|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"OBX|2|CE|20600^20600^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"TCD|20600^^99ROC|^1^:^1",
"INV|2060001|OK^^HL70383~CURRENT^^99ROC|R1|14168|1|42||||||20260131||||870587",
"INV|2060001|OK^^HL70383~CURRENT^^99ROC|R3|14168|1|42||||||20260131||||870587",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191450|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|57|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|47.3|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|2.80|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192510||11||||||||RSLT",
"OBR|5|\"\"||20710^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20710^20710^99ROC^^^IHELAW|1|32.9|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"OBX|2|CE|20710^20710^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"TCD|20710^^99ROC|^1^:^1",
"INV|2071002|OK^^HL70383~CURRENT^^99ROC|R1|9784|1|10||||||20261031||||837065",
"INV|2071002|OK^^HL70383~CURRENT^^99ROC|R3|9784|1|10||||||20261031||||837065",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191458|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|58|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|30.8|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|2.47|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192518||12||||||||RSLT",
"OBR|6|\"\"||20810^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20810^20810^99ROC^^^IHELAW|1|172|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"OBX|2|CE|20810^20810^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"TCD|20810^^99ROC|^1^:^1",
"INV|2081001|OK^^HL70383~CURRENT^^99ROC|R1|6582|1|1||||||20250831||||817145",
"INV|2081001|OK^^HL70383~CURRENT^^99ROC|R3|6582|1|1||||||20250831||||817145",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191506|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|59|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|168|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|10.0|U/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192526||13||||||||RSLT",
"OBR|7|\"\"||20990^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|20990^20990^99ROC^^^IHELAW|1|4.08|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"OBX|2|CE|20990^20990^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"TCD|20990^^99ROC|^1^:^1",
"INV|2099001|OK^^HL70383~CURRENT^^99ROC|R1|9205|1|38||||||20260531||||861343",
"INV|2099001|OK^^HL70383~CURRENT^^99ROC|R3|9205|1|38||||||20260531||||861343",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191418|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|60|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|4.06|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|0.217|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192438||7||||||||RSLT",
"OBR|8|\"\"||21130^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|21130^21130^99ROC^^^IHELAW|1|114|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"OBX|2|CE|21130^21130^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"TCD|21130^^99ROC|^1^:^1",
"INV|2113001|OK^^HL70383~CURRENT^^99ROC|R1|26664|1|15||||||20260531||||877983",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191514|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|61|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|113|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|5.31|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192534||14||||||||RSLT",
"OBR|9|\"\"||21191^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|21191^21191^99ROC^^^IHELAW|1|40.8|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"OBX|2|CE|21191^21191^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"TCD|21191^^99ROC|^1^:^1",
"INV|2119001|OK^^HL70383~CURRENT^^99ROC|R1|61695|1|41||||||20251130||||858723",
"INV|2119001|OK^^HL70383~CURRENT^^99ROC|R3|61695|1|41||||||20251130||||858723",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191522|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|62|||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|38.7|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|1.92|mg/dL^^99ROC||N^^HL70078|||F|||||HELV~BATCH||c303^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701192542||15||||||||RSLT",
"OBR|10|\"\"||29070^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|29070^29070^99ROC^^^IHELAW|1|108.7|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"OBX|2|CE|29070^29070^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"TCD|29070^^99ROC|^1^:^1",
"INV|2999002|OK^^HL70383~CURRENT^^99ROC|IS|15335|1|1||||||20260930||||850896",
"INV|2999001|OK^^HL70383~CURRENT^^99ROC|DIL|2348|1|1||||||20260930||||849713",
"INV|2999004|OK^^HL70383~CURRENT^^99ROC|REF|12572|1|1||||||20270331||||849277",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191410|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|13|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|113.0|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|3.0|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||1||||||||RSLT",
"OBR|11|\"\"||29080^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|29080^29080^99ROC^^^IHELAW|1|3.49|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"OBX|2|CE|29080^29080^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"TCD|29080^^99ROC|^1^:^1",
"INV|2999002|OK^^HL70383~CURRENT^^99ROC|IS|15335|1|1||||||20260930||||850896",
"INV|2999001|OK^^HL70383~CURRENT^^99ROC|DIL|2348|1|1||||||20260930||||849713",
"INV|2999004|OK^^HL70383~CURRENT^^99ROC|REF|12572|1|1||||||20270331||||849277",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191410|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|14|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|3.62|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|0.11|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||2||||||||RSLT",
"OBR|12|\"\"||29090^^99ROC|||||||",
"ORC|SC||||CM",
"TQ1|||||||||R^^HL70485",
"OBX|1|NM|29090^29090^99ROC^^^IHELAW|1|81.9|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT",
"OBX|2|CE|29090^29090^99ROC^^^IHELAW|1|^^99ROC|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT",
"TCD|29090^^99ROC|^1^:^1",
"INV|2999002|OK^^HL70383~CURRENT^^99ROC|IS|15335|1|1||||||20260930||||850896",
"INV|2999001|OK^^HL70383~CURRENT^^99ROC|DIL|2348|1|1||||||20260930||||849713",
"INV|2999004|OK^^HL70383~CURRENT^^99ROC|REF|12572|1|1||||||20270331||||849277",
"OBX|3|DTM|PT^Pipetting_Time^99ROC^S_OTHER^Other Supplemental^IHELAW|1|20250701191410|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT",
"OBX|4|EI|CalibrationID^CalibrationID^99ROC^S_OTHER^Other Supplemental^IHELAW|1|15|||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT",
"OBX|5|NM|QC_TARGET^QC_TARGET^99ROC^S_OTHER^Other Supplemental^IHELAW|1|85.8|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT",
"OBX|6|NM|QC_SD_RANGE^QC_SD_RANGE^99ROC^S_OTHER^Other Supplemental^IHELAW|1|2.6|mmol/L^^99ROC||N^^HL70078|||F|||||HELV~BATCH||ISE^ROCHE~24V5-03^ROCHE~1^ROCHE|20250701191441||3||||||||RSLT"`
].join('\r');

const cq01 = {
  messageHeader: {
    fieldSeparator: '|',
    encodingCharacters: '^~\\&',
    sendingApplication: 'cobas pure',
    receivingApplication: 'Host',
    dateTimeOfMessage: '20250705134941+0900',
    messageType: 'OUL^R22^OUL_R22',
    messageControlId: '1637',
    processingId: 'P',
    versionId: '2.5.1',
    acceptAcknowledgmentType: 'NE',
    applicationAcknowledgmentType: 'AL',
    characterSet: 'UNICODE UTF-8',
    messageProfileIdentifier: 'LAB-29^IHE'
  },
  order: {
    setId: '1',
    placerOrderNumber: '""',
    universalServiceIdentifier: '20340^^99ROC'
  },
  commonOrder: {
    orderControl: 'SC',
    orderStatus: 'CM'
  },
  timingQuantity: {
    priority: 'R^^HL70485'
  },
  testCodeDetail: {
    universalServiceIdentifier: '20340^^99ROC',
    autoDilutionFactor: '^1^:^1'
  },
  specimen: {
    setId: '1',
    specimenId: '20391&CONTROL',
    specimenType: '""',
    specimenRole: 'Q^^HL70369',
    specimenDescription: '~~~~',
    specimenExpirationDateTime: '20260430',
    specimenCondition: 'PSCO^^99ROC',
    containerType: 'SC^^99ROC'
  },
  specimenContainer: {
    containerIdentifier: '20391^CONTROL',
    carrierIdentifier: '704966'
  },
  inventory: {
    substanceIdentifier: '20391^PCCC1^99ROC',
    substanceStatus: 'OK^^HL703843',
    substanceType: 'CO^^HL70384',
    inventoryContainerIdentifier: '^^99ROC'
  },
  results: [
    {
      sequenceId: '1',
      observationName: '20340',
      value: '9.02',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '2',
      observationName: '20340',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191426',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '54',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '8.78',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '0.361',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192446'
    },
    {
      sequenceId: '1',
      observationName: '20411',
      value: '106',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '2',
      observationName: '20411',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191434',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '55',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '106',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '5.41',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192454'
    },
    {
      sequenceId: '1',
      observationName: '20420',
      value: '151',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '2',
      observationName: '20420',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191442',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '56',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '151',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '9.00',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192502'
    },
    {
      sequenceId: '1',
      observationName: '20600',
      value: '47.3',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '2',
      observationName: '20600',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191450',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '57',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '47.3',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '2.80',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192510'
    },
    {
      sequenceId: '1',
      observationName: '20710',
      value: '32.9',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '2',
      observationName: '20710',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191458',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '58',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '30.8',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '2.47',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192518'
    },
    {
      sequenceId: '1',
      observationName: '20810',
      value: '172',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '2',
      observationName: '20810',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191506',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '59',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '168',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '10.0',
      unit: 'U/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192526'
    },
    {
      sequenceId: '1',
      observationName: '20990',
      value: '4.08',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '2',
      observationName: '20990',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191418',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '60',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '4.06',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '0.217',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192438'
    },
    {
      sequenceId: '1',
      observationName: '21130',
      value: '114',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '2',
      observationName: '21130',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191514',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '61',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '113',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '5.31',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192534'
    },
    {
      sequenceId: '1',
      observationName: '21191',
      value: '40.8',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '2',
      observationName: '21191',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191522',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '62',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '38.7',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '1.92',
      unit: 'mg/dL',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701192542'
    },
    {
      sequenceId: '1',
      observationName: '29070',
      value: '108.7',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '2',
      observationName: '29070',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191410',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '13',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '113.0',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '3.0',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '1',
      observationName: '29080',
      value: '3.49',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '2',
      observationName: '29080',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191410',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '14',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '3.62',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '0.11',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '1',
      observationName: '29090',
      value: '81.9',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '2',
      observationName: '29090',
      value: '^^99ROC',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '3',
      observationName: 'Pipetting_Time',
      value: '20250701191410',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '4',
      observationName: 'CalibrationID',
      value: '15',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '5',
      observationName: 'QC_TARGET',
      value: '85.8',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    },
    {
      sequenceId: '6',
      observationName: 'QC_SD_RANGE',
      value: '2.6',
      unit: 'mmol/L',
      abnormalFlags: 'N^^HL70078',
      observationTimestamp: '20250701191441'
    }
  ]
};

const rawHL7MessageBuffer = parseRawStringToHL7Buffer(cobasMock);

// const msh = parseMshSegment(cobasMock)

// log.info('MSH Segment:', msh)

// const rawHL7MessageString = parseRawHL7ToString(rawHL7MessageBuffer)
// // log.debug('HL7 Message text', rawHL7MessageString)

// const extractedHL7Data = extractHl7Data(rawHL7MessageBuffer)

// log.debug('Extracted HL7 Data:', extractedHL7Data)

// const jsonData = HL7BufferToJson(rawHL7MessageBuffer)

// // log.debug('HL7 Data as JSON:', jsonData)
// // log.debug('HL7 SAC:', jsonData.SAC)

// const segment = getInformationBySegmentTypeAndIndex(
//   rawHL7MessageBuffer,
//   'MSH',
//   0
// )

// log.debug(`Segment MSH.1 -> ${segment}`)

// const componentValue = getHL7ValueBySegmentTypeFieldComponentAndSubcomponent(
//   rawHL7MessageBuffer,
//   'SAC',
//   12, // Field index for PID.5
//   2, // Component index for the first component
//   0 // Subcomponent index (not used here)
// )

const extractQcValuesAndConvertToJson =
  extractQcValuesAndConvertToJsonCobas(cq01);

log.debug('Extracted QC Values:', extractQcValuesAndConvertToJson);

// log.debug(`Component for PID.5.1: ${componentValue}`)

// writeDebugFile(JSON.stringify(jsonData, null, 2), 'parsing-example')

// extractQcValuesAndConvertToJsonCobas(extractedHL7Data)

module.exports = {
  rawHL7MessageBuffer
};
