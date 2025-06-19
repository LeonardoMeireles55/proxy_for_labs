// @ts-nocheck
const winston = require('winston');
const config = require('../config');

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

    if (config.logging.enableFileLogging) {
        transports.push(
            new winston.transports.File({
                filename: `${config.logging.logDir}/error.log`,
                level: 'error',
                maxsize: config.logging.maxFileSize,
                maxFiles: config.logging.maxFiles
            }),
            new winston.transports.File({
                filename: `${config.logging.logDir}/combined.log`,
                maxsize: config.logging.maxFileSize,
                maxFiles: config.logging.maxFiles
            })
        );
    }

    return winston.createLogger({
        level: config.logLevel,
        format: logFormat,
        transports
    });
};

const log = createLogger();

module.exports = log;
