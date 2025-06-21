const log = require('./src/utils/logger')
const env = require('./src/config')
const TCPForwardProxy = require('./src/proxies/tcp-forward-proxy')
const TCPReverseProxy = require('./src/proxies/tcp-reverse-proxy')
const Connection = require('./src/proxies/connection')


const startApp = () => {

    if (env.proxy.isReverseProxy) {
        log.info('Starting TCP Reverse Proxy...')


        TCPReverseProxy.listen(env.port, () => {
            log.info(`TCP Reverse Proxy listening on port ${env.port}`)
        })

    }

    if (env.proxy.isForwardProxy) {
        log.info('Starting TCP Forward Proxy...')


        TCPForwardProxy.listen(env.port, () => {
            log.info(`TCP Forward Proxy listening on port ${env.port}`)
        })
    }

    if (!env.proxy.isReverseProxy && !env.proxy.isForwardProxy) {
        log.error('No proxy type specified. Please set either IS_REVERSE_PROXY or IS_FORWARD_PROXY in the environment variables.')

        process.exit(1)
    }

    if (env.proxy.isReverseProxy && env.proxy.isForwardProxy) {
        log.error('Both IS_REVERSE_PROXY and IS_FORWARD_PROXY are set to true.')

        process.exit(1)
    }
}


startApp()
process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err)
    process.exit(1)
})



