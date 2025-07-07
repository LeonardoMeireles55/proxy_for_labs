const log = require('../../configs/logger');
const config = require('../../configs/config');

const API_BASE_URL = config.baseUrl;

const API_BASE_LOGIN = `${API_BASE_URL}/users/sign-in`;

const API_BASE_HEMATOLOGY_URL = `${API_BASE_URL}/hematology-analytics/with-equipment`;
const API_BASE_BIOCHEMISTRY_URL = `${API_BASE_URL}/biochemistry-analytics/with-equipment`;
const API_BASE_COAGULATION_URL = `${API_BASE_URL}/coagulation-analytics/with-equipment`;

const API_CQ_URL = () => {
  switch (config.qcForSector) {
    case 'hematology':
      return API_BASE_HEMATOLOGY_URL;
    case 'biochemistry':
      return API_BASE_BIOCHEMISTRY_URL;
    case 'coagulation':
      return API_BASE_COAGULATION_URL;
    default:
      log.error(
        `Invalid QC sector: ${config.qcForSector}. Defaulting to hematology.`
      );
      return API_BASE_HEMATOLOGY_URL;
  }
};

const AUTH_CREDENTIALS = JSON.stringify({
  identifier: 'Automacao',
  password: 'labhelv2024@'
});

const retrieveToken = async () => {
  const responseToken = await fetch(`${API_BASE_LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: AUTH_CREDENTIALS
  });
  if (!responseToken.ok) {
    const errorMessage = `Error: ${responseToken.status} - ${
      responseToken.statusText
        ? responseToken.statusText
        : 'An error occurred while retrieving the token'
    }`;
    log.error(errorMessage);
  }
  const resultToken = await responseToken.json();
  return resultToken.tokenJWT;
};

/**
 * Sends test result data to lab-spec.systems API
 * @param {Object} jsonResult - The test result in JSON format
 */
const sendToLabSpecAPI = async (jsonResult) => {
  try {
    log.debug('Sending to lab-spec API:', JSON.stringify(jsonResult, null, 2));

    // Get authentication token
    const token = await retrieveToken();

    // Send POST request to lab-spec.systems
    const response = await fetch(
      'https://lab-spec.systems/backend/biochemistry-analytics/with-equipment/without-mean-sd',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(jsonResult)
      }
    );

    if (!response.ok) {
      const errorMessage =
        'Error sending to lab-spec API: ' +
        response.status +
        ' - ' +
        (response.statusText || 'An error occurred');
      log.error(errorMessage);
    }

    const result = await response.json();
    log.debug(
      'Successfully sent data to lab-spec API:',
      JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    log.error('Error in sendToLabSpecAPI:', error.message);
  }
};

const postQualityControlData = async (transformedData) => {
  const token = await retrieveToken();

  try {
    const response = await fetch(`${API_CQ_URL()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(transformedData)
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${
        response.statusText
          ? response.statusText
          : 'An error occurred while sending the data'
      }`;
      log.error(errorMessage);
    }

    const result = await response.json();

    if (response.ok) {
      log.debug('Data sent successfully:', result);
    }

    return result;
  } catch (error) {
    log.error('An error occurred while sending the data:', error);
  }
};

module.exports = { postQualityControlData, sendToLabSpecAPI };
