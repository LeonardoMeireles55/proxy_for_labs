/**
 * Converts ASTM message to JSON format
 * @param {string} astmMessage - The ASTM message string
 * @returns {Array} Array of test results in JSON format
 */
function convertAstmToJson(astmMessage) {
    const segments = astmMessage.trim().split('\n');

    // Initialize variables
    const results = [];
    let testPanelName = "";
    let labTestRequest = 1;
    let testPanelId = 1;
    let recordId = 1;
    let patientName = "";
    let patientId = "";
    let unitOfMeasurement = "";
    let sampleType = "";
    let dateCreated = "";
    let facilityName = "";
    let patientBirthday = "";
    let patientSex = "";
    let result = "";

    for (const segment of segments) {
        // Skip empty segments which might be caused by consecutive '|'
        if (!segment.trim()) {
            continue;
        }        const fields = segment.split('|');

        if (fields[0] === 'H') {
            facilityName = fields[4] || "Unknown";
            dateCreated = fields[13] || "Unknown";
        }
        else if (fields[0] === 'P') {
            patientId = fields[3] || "Unknown";
            patientName = fields[5] || "Unknown";
            patientBirthday = fields[7] || "Unknown";
            patientSex = fields[8] || "Unknown";
        }
        else if (fields[0] === 'O') {
            testPanelName = fields[4] || "Unknown";
            sampleType = fields[15] || "Unknown";
        }        else if (fields[0] === "R") {
            unitOfMeasurement = fields[4] || "Unknown";
            result = fields[8] || "Unknown";
        }

        const resultJson = {
            id: labTestRequest,
            test_panel_name: testPanelName,
            result: result && !isNaN(parseFloat(result)) ? parseFloat(result) : null,
            test_panel_id: testPanelId,
            record_id: recordId,
            patient_name: patientName,
            patient_id: patientId,
            patient_sex: patientSex,
            sample_type: sampleType,
            unit_of_measurement: unitOfMeasurement,
            date_created: dateCreated,
            facility_name: facilityName,
            patient_birthday: patientBirthday
        };

        results.push(resultJson);
        labTestRequest++;
        testPanelId++;
        recordId++;
    }

    return results;
}

module.exports = { convertAstmToJson };
