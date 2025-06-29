/**
 * @fileoverview Winston-based logging utility for the proxy application
 * This module creates a centralized logger with console output and configurable log levels.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

// @ts-nocheck
const winston = require('winston');
const env = require('./config');

// Configurar cores customizadas
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
  verbose: 'magenta'
});

/**
 * Custom formatter for better console readability
 * Hides level label for debug messages to reduce noise
 */
const customConsoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';

    // Convert message to string if it's an object
    const formattedMessage =
      typeof message === 'object' && message !== null
        ? JSON.stringify(message, null, 2)
        : message;

    // Hide level for debug messages to reduce visual noise
    if (level.includes('debug')) {
      return `[${timestamp}] ${formattedMessage}${metaStr}`;
    }

    return `[${timestamp}] ${level}: ${formattedMessage}${metaStr}`;
  })
);

/**
 * Creates and configures a Winston logger instance
 * Sets up console transport with enhanced formatting and optional file logging
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
      format: customConsoleFormat,
      silent: env.logLevel === 'silent'
    })
  ];

  // Add file transport in production or when explicitly enabled
  if (env.logToFile || process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return winston.createLogger({
    level: env.logLevel || 'info',
    format: logFormat,
    transports,
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true
  });
};

/**
 * Singleton logger instance used throughout the application
 * @type {winston.Logger}
 */
const log = createLogger();

// Create logs directory if it doesn't exist and file logging is enabled
if (env.logToFile || process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

module.exports = log;
