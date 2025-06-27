/**
 * @fileoverview Winston-based logging utility for the proxy application
 * This module creates a centralized logger with console output and configurable log levels.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

// @ts-nocheck
const winston = require('winston');
const env = require('../../config');

// Configurar cores customizadas
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

/**
 * Custom formatter for better console readability
 */
const customConsoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ?
            `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

/**
 * Creates and configures a Winston logger instance
 * Sets up console transport with enhanced formatting
 *
 * @function createLogger
 * @returns {winston.Logger} Configured Winston logger instance
 */
const createLogger = () => {
    const logFormat = winston.format.combine(
        winston.format.errors({ verbose: true, stack: true }),
        winston.format.json()
    );

    const transports = [
        new winston.transports.Console({
            format: customConsoleFormat
        })
    ];

    return winston.createLogger({
        level: env.logLevel,
        format: logFormat,
        transports
    });
};

/**
 * Singleton logger instance used throughout the application
 * @type {winston.Logger}
 */
const log = createLogger();

module.exports = log;
