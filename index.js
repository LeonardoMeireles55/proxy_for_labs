const log = require('./src/utils/logger')
const env = require('./src/config')
const TCPForwardProxy = require('./src/proxies/tcp-forward-proxy')
const tcpReverseProxy = require('./src/proxies/tcp-reverse-proxy')
const simulateConnection = require('./src/proxies/simulate-connection')


const validateProxyConfig = () => {
    const { isReverseProxy, isForwardProxy } = env.proxy

    if (!isReverseProxy && !isForwardProxy) {
        log.error('No proxy type specified. Please set either IS_REVERSE_PROXY or IS_FORWARD_PROXY in the environment variables.')
        process.exit(1)
    }

    if (isReverseProxy && isForwardProxy) {
        log.error('Both IS_REVERSE_PROXY and IS_FORWARD_PROXY are set to true.')
        process.exit(1)
    }
}

const startReverseProxy = () => {
    log.info('Starting TCP Reverse Proxy...')

    tcpReverseProxy.listen(env.port, () => {
        log.info(`TCP Reverse Proxy listening on port ${env.port}`)
        simulateConnection()
    })
}

const startForwardProxy = () => {
    log.info('Starting TCP Forward Proxy...')

    TCPForwardProxy.listen(env.port, () => {
        log.info(`TCP Forward Proxy listening on port ${env.port}`)
    })
}

const startApp = () => {
    validateProxyConfig()

    if (env.proxy.isReverseProxy) {
        startReverseProxy()
    }

    if (env.proxy.isForwardProxy) {
        startForwardProxy()
    }
}


startApp()

process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err)
    process.exit(1)
})



