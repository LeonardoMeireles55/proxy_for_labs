// @ts-nocheck
const winston = require('winston');
const env = require('../config');

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

const log = createLogger();

module.exports = log;
