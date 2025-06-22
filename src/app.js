const log = require('./utils/logger')
const env = require('./config')
const TCPForwardProxy = require('./core/tcp-forward-proxy')
const tcpReverseProxy = require('./core/tcp-reverse-proxy')

// Application state - using any type to avoid TypeScript strict typing issues
let appState = {
    forwardProxy: /** @type {any} */ (undefined),
    reverseProxy: /** @type {any} */ (undefined),
    equipmentServer: /** @type {any} */ (undefined),
    isRunning: false,
    connections: new Set() // Track active connections
}

// Track connections for graceful shutdown
const trackConnection = (socket) => {
    appState.connections.add(socket)
    socket.on('close', () => {
        appState.connections.delete(socket)
    })
}

// Force close all connections
const forceCloseConnections = () => {
    log.info(`Force closing ${appState.connections.size} active connections`)
    appState.connections.forEach(socket => {
        try {
            socket.destroy()
        } catch (err) {
            // Ignore errors when destroying sockets
        }
    })
    appState.connections.clear()
}

// Configuration validation
const validateProxyConfig = () => {
    const { isReverseProxy, isForwardProxy } = env.proxy

    if (!isReverseProxy && !isForwardProxy) {
        throw new Error('No proxy type specified. Please set either IS_REVERSE_PROXY or IS_FORWARD_PROXY in the environment variables.')
    }

    if (isReverseProxy && isForwardProxy) {
        throw new Error('Both IS_REVERSE_PROXY and IS_FORWARD_PROXY are set to true.')
    }
}

// Start reverse proxy server (without simulators)
const startReverseProxy = () => {
    return new Promise((resolve, reject) => {
        log.info('Starting TCP Reverse Proxy...')

        const reverseProxy = tcpReverseProxy
        reverseProxy.listen(env.port, (err) => {
            if (err) return reject(err)

            appState.reverseProxy = reverseProxy
            log.info(`TCP Reverse Proxy listening on port ${env.port}`)
            log.info('Reverse proxy ready - simulators can be started via CLI')
            resolve(undefined)
        })
    })
}

// Start forward proxy server
const startForwardProxy = () => {
    return new Promise((resolve, reject) => {
        log.info('Starting TCP Forward Proxy...')

        const forwardProxy = TCPForwardProxy
        forwardProxy.listen(env.port, (err) => {
            if (err) return reject(err)

            appState.forwardProxy = forwardProxy
            log.info(`TCP Forward Proxy listening on port ${env.port}`)
            resolve(undefined)
        })
    })
}

// Main application start function
const startApp = async () => {
    try {
        validateProxyConfig()

        if (env.proxy.isReverseProxy) {
            await startReverseProxy()
        }

        if (env.proxy.isForwardProxy) {
            await startForwardProxy()
            // For forward proxy mode, optionally start equipment server if needed
            // (not started by default to avoid port conflicts)
        }

        appState.isRunning = true
        log.info('Proxy application started successfully')
    } catch (error) {
        log.error('Failed to start proxy application:', error.message || error)
        log.error('Stack trace:', error.stack)
        throw error
    }
}

// Helper function to close server safely with timeout
const closeServer = (server, timeout = 5000) => {
    return new Promise(resolve => {
        if (!server || typeof server.close !== 'function') {
            resolve(undefined)
            return
        }

        let resolved = false

        // Set timeout to force close
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true
                log.warn('Server close timeout reached, forcing shutdown')
                resolve(undefined)
            }
        }, timeout)

        // Attempt graceful close
        server.close((err) => {
            if (!resolved) {
                resolved = true
                clearTimeout(timeoutId)
                if (err) {
                    log.warn('Server close error:', err.message)
                }
                resolve(undefined)
            }
        })

        // Force close all connections
        if (server.listening) {
            server.getConnections((err, count) => {
                if (!err && count > 0) {
                    log.info(`Closing ${count} active connections`)
                }
            })
        }
    })
}

// Stop application servers
const stopApp = async () => {
    log.info('Stopping proxy application...')

    // First, force close all tracked connections
    forceCloseConnections()

    const servers = [
        { name: 'Forward Proxy', server: appState.forwardProxy },
        { name: 'Reverse Proxy', server: appState.reverseProxy },
        { name: 'Equipment Server', server: appState.equipmentServer }
    ]

    // Close all servers in parallel with timeout
    const closePromises = servers.map(({ name, server }) => {
        if (server) {
            log.info(`Closing ${name}...`)
            return closeServer(server, 3000)
        }
        return Promise.resolve()
    })

    try {
        await Promise.all(closePromises)
        log.info('All servers closed successfully')
    } catch (error) {
        log.error('Error during server shutdown:', error.message)
    }

    // Reset state
    appState.isRunning = false
    appState.forwardProxy = undefined
    appState.reverseProxy = undefined
    appState.equipmentServer = undefined
    appState.connections.clear()

    log.info('Proxy application stopped')
}

// Get current application state
const getAppState = () => ({ ...appState })

// Export functions
module.exports = {
    startApp,
    stopApp,
    getAppState,
    validateProxyConfig,
    trackConnection
}
