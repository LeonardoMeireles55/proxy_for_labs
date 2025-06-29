const {
  parseRawStringToHL7Buffer,
  parseRawHL7ToString,
  extractHl7Data,
  HL7toJson,
  getInformationBySegmentTypeAndIndex
} = require('./src/handlers/hl7');
const log = require('./configs/logger');
const { writeDebugFile } = require('./src/shared/save-data-to-file');

/* * Example HL7 message for testing
 * This is a sample HL7 message that can be used to test the parsing functions
 * It includes various segments like MSH, PID, OBR, OBX, NTE, and FT1
 * The message is formatted as a string with segments separated by carriage returns
 */

const hl7Message = [
  // Message Header
  'MSH|^~\\&|Informatics|161387862^Quest Diagnostics^L||LABGATEWAY^UnitedHealth Group^L|20190917010635-0600||ORU^R01^ORU_R01|M1926001063500000963|P|2.5||||||||',

  // Event Type
  'EVN|R01|20190917010635-0600|||^SYSTEM^SYSTEM',

  // Patient Identification
  'PID|1||820154899^^^^HC~123456789^^^^SSN||BEIGHE^DENISE^I^JR^MRS^L|MAIDEN^SANDRA|19600415|F|||3174 E DESERT BROOM WAY^^PHOENIX^AZ^85048^USA^M~PO BOX 12345^^PHOENIX^AZ^85001^USA^C||(623)252-1760~(623)252-1761|ENGLISH|M|CHR|820154899|||N|USA||||||||||20190101',

  // Next of Kin/Associated Parties
  'NK1|1|BEIGHE^JOHN^M|SPO^SPOUSE|3174 E DESERT BROOM WAY^^PHOENIX^AZ^85048^USA|(623)252-1762|(623)252-1763|EC^EMERGENCY CONTACT',

  // Patient Visit
  'PV1|1|O|OUTPT^^^^O|R||^||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD|||LAB||||R||^||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD|HMO|705963|||||||||||||||||||O|||20190815000000',

  // Patient Visit - Additional Info
  'PV2|||^Annual Physical Exam|||||||||||||||||||||V',

  // Common Order
  'ORC|RE|LAB123456|PHO2019081541408081|||||20190815000000|||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD',

  // Observation Request - Complete Blood Count
  'OBR|1|LAB123456|PHO2019081541408081|85025^^C4^CBC^Complete Blood Count^L|||20190815000000-0600||||G|||||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD||||||20190815215000-0600|||F|||||||&GRP1',

  // CBC Results
  'OBX|1|NM|33747-0^RBC^LN^RBC^Red Blood Cell Count^L||4.5|10*6/uL^10*6/uL^ISO+|4.0-5.5||||F|||20190815',
  'OBX|2|NM|6690-2^WBC^LN^WBC^White Blood Cell Count^L||7.2|10*3/uL^10*3/uL^ISO+|4.5-11.0||||F|||20190815',
  'OBX|3|NM|718-7^HGB^LN^HGB^Hemoglobin^L||13.8|g/dL^g/dL^ISO+|12.0-15.5||||F|||20190815',
  'OBX|4|NM|4544-3^HCT^LN^HCT^Hematocrit^L||41.2|%^%^ISO+|36.0-46.0||||F|||20190815',
  'OBX|5|NM|787-2^MCV^LN^MCV^Mean Cell Volume^L||89|fL^fL^ISO+|80-100||||F|||20190815',

  // Second Order - Hemoglobin A1c
  'ORC|RE|LAB123457|PHO2019081541408082|||||20190815000000|||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD',
  'OBR|2|LAB123457|PHO2019081541408082|83036^^C4^9230^Hemoglobin A1c With eAG^L|||20190815000000-0600||||G|||||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD||||||20190815215000-0600|||F|||||||&GRP2',
  'OBX|6|NM|4548-4^Hemoglobin A1c^LN^10009230^Hemoglobin A1c^L||5.2|%^^ISO+|<5.7||||F|||20190815',
  "NTE|1|L|The American Diabetes Association (ADA) guidelines for interpreting Hemoglobin A1c are as follows: Non-Diabetic patient: <=5.6% ~ Increased risk for future Diabetes: 5.7-6.4% ~ ADA diagnostic criteria for Diabetes: >=6.5% ~ Values for patients with Diabetes: Meets ADA's recommended goal for therapy: <7.0% ~ Exceeds ADA's recommended goal: 7.0-8.0% ~ ADA recommends reevaluation of therapy: >8.0%",
  'OBX|7|NM|27353-2^Estimated Average Glucose (eAG)^LN^12009230^Estimated Average Glucose (eAG)^L||103|mg/dL^mg/dL^ISO+|Not Established||||F|||20190815',

  // Third Order - Basic Metabolic Panel
  'ORC|RE|LAB123458|PHO2019081541408083|||||20190815000000|||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD',
  'OBR|3|LAB123458|PHO2019081541408083|80048^^C4^BMP^Basic Metabolic Panel^L|||20190815000000-0600||||G|||||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD||||||20190815215000-0600|||F|||||||&GRP3',
  'OBX|8|NM|2951-2^Sodium^LN^NA^Sodium^L||140|mmol/L^mmol/L^ISO+|136-145||||F|||20190815',
  'OBX|9|NM|2823-3^Potassium^LN^K^Potassium^L||4.2|mmol/L^mmol/L^ISO+|3.5-5.1||||F|||20190815',
  'OBX|10|NM|2075-0^Chloride^LN^CL^Chloride^L||102|mmol/L^mmol/L^ISO+|98-107||||F|||20190815',
  'OBX|11|NM|1963-8^CO2^LN^CO2^Carbon Dioxide^L||24|mmol/L^mmol/L^ISO+|22-29||||F|||20190815',
  'OBX|12|NM|6299-2^BUN^LN^BUN^Blood Urea Nitrogen^L||18|mg/dL^mg/dL^ISO+|6-24||||F|||20190815',
  'OBX|13|NM|2160-0^Creatinine^LN^CREAT^Creatinine^L||0.9|mg/dL^mg/dL^ISO+|0.6-1.3||||F|||20190815',
  'OBX|14|NM|2345-7^Glucose^LN^GLU^Glucose^L||95|mg/dL^mg/dL^ISO+|70-100||||F|||20190815',

  // Fourth Order - Lipid Panel
  'ORC|RE|LAB123459|PHO2019081541408084|||||20190815000000|||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD',
  'OBR|4|LAB123459|PHO2019081541408084|80061^^C4^LIPID^Lipid Panel^L|||20190815000000-0600||||G|||||1225300882^ZAMANI^SAMIRA^^^^^^NPI^^^^^MD||||||20190815215000-0600|||F|||||||&GRP4',
  'OBX|15|NM|2093-3^Total Cholesterol^LN^CHOL^Total Cholesterol^L||185|mg/dL^mg/dL^ISO+|<200||||F|||20190815',
  'OBX|16|NM|2571-8^Triglycerides^LN^TRIG^Triglycerides^L||125|mg/dL^mg/dL^ISO+|<150||||F|||20190815',
  'OBX|17|NM|2085-9^HDL Cholesterol^LN^HDL^HDL Cholesterol^L||58|mg/dL^mg/dL^ISO+|>40||||F|||20190815',
  'OBX|18|NM|18262-6^LDL Cholesterol^LN^LDL^LDL Cholesterol^L||102|mg/dL^mg/dL^ISO+|<100||||F|||20190815',
  'OBX|19|NM|9830-1^Cholesterol/HDL Ratio^LN^RATIO^Cholesterol/HDL Ratio^L||3.2|ratio^ratio^ISO+|<5.0||||F|||20190815',

  // Additional Notes
  'NTE|2|L|Patient was fasting for 12 hours prior to blood draw.',
  'NTE|3|L|All results are within normal limits. Continue current medications.',
  'NTE|4|L|Recommend annual follow-up for routine screening.',

  // Insurance/Financial Information
  'FT1|1|||20190815||CG|85025^^C4^CBC^Complete Blood Count^L|||||||705963^United Healthcare^HC|||||||||||85025^^C4^CBC^Complete Blood Count^L',
  'FT1|2|||20190815||CG|83036^^C4^9230^Hemoglobin A1c With eAG^L|||||||705963^United Healthcare^HC|||||||||||83036^^C4^9230^Hemoglobin A1c With eAG^L',
  'FT1|3|||20190815||CG|80048^^C4^BMP^Basic Metabolic Panel^L|||||||705963^United Healthcare^HC|||||||||||80048^^C4^BMP^Basic Metabolic Panel^L',
  'FT1|4|||20190815||CG|80061^^C4^LIPID^Lipid Panel^L|||||||705963^United Healthcare^HC|||||||||||80061^^C4^LIPID^Lipid Panel^L',

  // Diagnosis
  'DG1|1|I10|Z00.00^Encounter for general adult medical examination without abnormal findings^ICD10|||A',
  'DG1|2|I10|Z13.220^Encounter for screening for lipoid disorders^ICD10|||A',

  // Additional Insurance Information
  'IN1|1|705963|UHC001|United Healthcare|PO Box 740815^^Atlanta^GA^30374|||GRP123456|||||||||BEIGHE^DENISE^I||01|19600415|3174 E DESERT BROOM WAY^^PHOENIX^AZ^85048|||1||||||||||||||||820154899',
  'IN2|1||820154899|UnitedHealth Group|||||||||||||||||||||UHC001',

  // Guarantor Information
  'GT1|1||BEIGHE^DENISE^I^^^^L||19600415|F|||3174 E DESERT BROOM WAY^^PHOENIX^AZ^85048^USA|(623)252-1760|||||S||||||||||||||||||||||',

  // Specimen Information
  'SPM|1|||119297000^Blood specimen^SCT||||||||P||||||20190815080000',

  // Container Information
  'SAC|1|||LAV^Lavender top tube^HL70376||||||||||||'
].join('\r');

const rawHL7MessageBuffer = parseRawStringToHL7Buffer(hl7Message);
log.debug(rawHL7MessageBuffer.toJSON());

const rawHL7MessageString = parseRawHL7ToString(rawHL7MessageBuffer);
log.debug('HL7 Message text', rawHL7MessageString);

const extractedHL7Data = extractHl7Data(rawHL7MessageBuffer);
log.debug('Extracted HL7 Data:', extractedHL7Data);

const jsonData = HL7toJson(rawHL7MessageBuffer);

log.debug('HL7 Data as JSON:', jsonData);
log.debug('HL7 PID:', jsonData.PID);

const segment = getInformationBySegmentTypeAndIndex(
  rawHL7MessageBuffer,
  'MSH',
  5
);

log.debug(`Segment MSH.5 -> ${segment}`);

writeDebugFile(JSON.stringify(jsonData, null, 2), 'parsing-example');
