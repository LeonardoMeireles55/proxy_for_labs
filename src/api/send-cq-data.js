const log = require('../../configs/logger')


const API_BASE_URL = 'http://lab-spec.systems/backend'

const AUTH_CREDENTIALS = JSON.stringify({
    identifier: 'Automacao',
    password: 'labhelv2024@'
})


const retrieveToken = async () => {
    const responseToken = await fetch('https://lab-spec.systems/backend/users/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: AUTH_CREDENTIALS
    })
    if (!responseToken.ok) {
        const errorMessage = `Error: ${responseToken.status} - ${responseToken.statusText ? responseToken.statusText : 'An error occurred while retrieving the token'}`
        log.error(errorMessage)
    }
    const resultToken = await responseToken.json()
    return resultToken.tokenJWT
};


const postQualityControlData = async (transformedData) => {

    const token = await retrieveToken()

    try {
        const response = await fetch('https://lab-spec.systems/backend/hematology-analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(transformedData),


        })
        if (!response.ok) {
            const errorMessage = `Error: ${response.status} - ${response.statusText ? response.statusText : 'An error occurred while sending the data'}`
            log.error(errorMessage)
        }

        const result = await response.json()

        if(response.ok) {
            log.info('Data sent successfully:', result)
        }

        return result
    } catch (error) {
        log.error('An error occurred while sending the data:', error)
    }
};

module.exports = { postQualityControlData }
