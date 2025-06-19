const getApiTokenByLogin = require('./get-api-token-by-login');

const sendToExternalApi = async (req, res) => {
    try {

        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const getToken = await getApiTokenByLogin();

        const response = await fetch('https://api.example.com/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken.token}`,
        },

        body: JSON.stringify(req.body),

    });

        if (!response.ok) {
        throw new Error('Failed to send data to external API');
        }

        const data = await response.json();

        res.status(200).json({
            message: 'Data sent successfully',
            data: data,
        });

    } catch (error) {
        console.error('Error sending data to external API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = sendToExternalApi;
