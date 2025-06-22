#!/usr/bin/env node

const { startApp, stopApp } = require('../src/app')
const log = require('../src/utils/logger')

console.log('🚀 Laboratory Proxy Server')
console.log('==========================')

// Main application startup function
const main = async () => {
    try {
        await startApp()
        console.log('✅ Proxy server is running. Press Ctrl+C to stop.')
    } catch (error) {
        log.error('Failed to start application:', error.message)
        process.exit(1)
    }
}

// Create shutdown handler function
const createShutdownHandler = (signal) => async () => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`)

    // Set timeout to force exit if graceful shutdown fails
    const forceExitTimeout = setTimeout(() => {
        console.log('⚠️  Graceful shutdown timeout reached, forcing exit')
        process.exit(1)
    }, 10000) // 10 seconds timeout

    try {
        await stopApp()
        clearTimeout(forceExitTimeout)
        console.log('✅ Server stopped successfully')
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

// Setup all process event handlers
const setupProcessHandlers = () => {
    process.on('SIGTERM', createShutdownHandler('SIGTERM'))
    process.on('SIGINT', createShutdownHandler('SIGINT'))
    process.on('uncaughtException', handleUncaughtException)
    process.on('unhandledRejection', handleUnhandledRejection)
}

// Initialize and run
const run = () => {
    setupProcessHandlers()
    main()
}

run()
