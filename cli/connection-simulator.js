#!/usr/bin/env node

const log = require('../src/utils/logger')
const env = require('../src/config')
const simulateConnection = require('../src/simulators/simulate-connection')

console.log('🔗 Connection Simulator')
console.log('=======================')

// Application state for connection simulator
let connectionClient = null

// Start connection simulation
const startConnectionSimulator = () => {
    try {
        log.info('Starting Connection Simulation...')
        console.log(`🔗 Connecting to LIS at ${env.lisHost}:${env.lisPort}...`)

        connectionClient = simulateConnection()

        // Track connection for cleanup
        connectionClient.on('connect', () => {
            console.log('✅ Connection simulator started successfully')
            console.log(`📡 Connected to: ${env.lisHost}:${env.lisPort}`)
            console.log('🔄 Simulating client-server communication...')
            console.log('Press Ctrl+C to stop the simulator')
        })

        connectionClient.on('error', (err) => {
            console.error('❌ Connection error:', err.message)
            console.log('Make sure the proxy server is running first!')
        })

        connectionClient.on('close', () => {
            console.log('🔌 Connection simulator disconnected')
        })

    } catch (error) {
        log.error('Failed to start connection simulator:', error.message)
        throw error
    }
}

// Stop connection simulator
const stopConnectionSimulator = async () => {
    return new Promise(resolve => {
        if (connectionClient && typeof connectionClient.destroy === 'function') {
            log.info('Stopping Connection Simulator...')
            connectionClient.destroy()
            log.info('Connection Simulator stopped')
        }
        resolve(undefined)
    })
}

// Graceful shutdown handler
const createShutdownHandler = (signal) => async () => {
    console.log(`\n🛑 Received ${signal}. Shutting down connection simulator...`)

    const forceExitTimeout = setTimeout(() => {
        console.log('⚠️  Shutdown timeout reached, forcing exit')
        process.exit(1)
    }, 3000)

    try {
        await stopConnectionSimulator()
        clearTimeout(forceExitTimeout)
        console.log('✅ Connection simulator stopped successfully')
        process.exit(0)
    } catch (error) {
        clearTimeout(forceExitTimeout)
        log.error('Error during shutdown:', error.message)
        process.exit(1)
    }
}

// Error handling functions
const handleUncaughtException = (err) => {
    log.error('Uncaught Exception:', err)
    process.exit(1)
}

const handleUnhandledRejection = (reason, promise) => {
    log.error('Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
}

// Setup process handlers
const setupProcessHandlers = () => {
    process.on('SIGTERM', createShutdownHandler('SIGTERM'))
    process.on('SIGINT', createShutdownHandler('SIGINT'))
    process.on('uncaughtException', handleUncaughtException)
    process.on('unhandledRejection', handleUnhandledRejection)
}

// Main function
const main = async () => {
    try {
        startConnectionSimulator()
    } catch (error) {
        log.error('Failed to start connection simulator:', error.message)
        process.exit(1)
    }
}

// Initialize and run
const run = () => {
    setupProcessHandlers()
    main()
}

run()
