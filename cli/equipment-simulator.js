#!/usr/bin/env node

const log = require('../src/utils/logger')
const env = require('../src/config')
const simulateEquipmentServer = require('../src/simulators/simulate-equipment')

console.log('🔬 Equipment Simulator')
console.log('======================')

// Application state for equipment simulator
let equipmentServer = null

// Start equipment server
const startEquipmentServer = () => {
    return new Promise((resolve, reject) => {
        log.info('Starting Simulated Equipment Server...')

        equipmentServer = simulateEquipmentServer
        equipmentServer.listen(env.equipmentPort, (err) => {
            if (err) {
                log.error(`Failed to start equipment server on port ${env.equipmentPort}:`, err.message)
                return reject(err)
            }

            log.info(`🔬 Simulated Equipment Server listening on ${env.equipmentHost}:${env.equipmentPort}`)
            console.log(`✅ Equipment simulator ready for connections`)
            console.log(`📡 Listening on: ${env.equipmentHost}:${env.equipmentPort}`)
            console.log('Press Ctrl+C to stop the simulator')
            resolve(undefined)
        })
    })
}

// Stop equipment server
const stopEquipmentServer = async () => {
    return new Promise(resolve => {
        if (equipmentServer && typeof equipmentServer.close === 'function') {
            log.info('Stopping Equipment Simulator...')
            equipmentServer.close(() => {
                log.info('Equipment Simulator stopped')
                resolve(undefined)
            })
        } else {
            resolve(undefined)
        }
    })
}

// Graceful shutdown handler
const createShutdownHandler = (signal) => async () => {
    console.log(`\n🛑 Received ${signal}. Shutting down equipment simulator...`)

    const forceExitTimeout = setTimeout(() => {
        console.log('⚠️  Shutdown timeout reached, forcing exit')
        process.exit(1)
    }, 5000)

    try {
        await stopEquipmentServer()
        clearTimeout(forceExitTimeout)
        console.log('✅ Equipment simulator stopped successfully')
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
        await startEquipmentServer()
    } catch (error) {
        log.error('Failed to start equipment simulator:', error.message)
        process.exit(1)
    }
}

// Initialize and run
const run = () => {
    setupProcessHandlers()
    main()
}

run()
