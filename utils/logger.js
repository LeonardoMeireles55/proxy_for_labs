/**
 * @fileoverview Winston-based logging utility for the proxy application
 * This module creates a centralized logger with console output and configurable log levels.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

// @ts-nocheck
const winston = require('winston');
const env = require('../config');

/**
 * Creates and configures a Winston logger instance
 * Sets up console transport with colorized output and JSON formatting
 *
 * @function createLogger
 * @returns {winston.Logger} Configured Winston logger instance
 */
const createLogger = () => {
    const logFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    );

    const transports = [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
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
