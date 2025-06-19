const env = require('../config');

const getApiTokenByLogin = async (req, res, next) => {
    try {

        if (!req.body) {
            return res.status(400).json({ error: 'Login is required' })
        }

        // Simulate fetching the API token based on the login
        const apiToken = await fetch(
            env.externalAPI.loginUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    indentifier: req.body.indentifier,
                    password: req.body.password
                }),
            }
        )

        if (!apiToken.ok) {
            return res.status(401).json({ error: 'Invalid login credentials' })
        }

        const tokenData = await apiToken.json()

        if (!tokenData?.token) {
            return res.status(500).json({ error: 'Failed to retrieve API token' })
        }

        return res.status(200).json({
            message: 'API token retrieved successfully',
            token: tokenData.tokenJWT.token,
        })

    } catch (error) {
        console.error('Error fetching API token:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

module.exports = getApiTokenByLogin;
