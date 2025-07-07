const net = require('node:net');

const {
  sendHL7Acknowledgment,
  createAcknowledgment
} = require('../../handlers/hl7/helpers/hl7-acknowledgment');
const config = require('../../../configs/config');
const log = require('../../../configs/logger');
const parser = require('../../handlers/hl7/helpers/hl7-parsers');

/**
 * Creates connection to proxy server
 */
const createConnection = () => {
  const client = net.connect(
    {
      host: config.proxyHost,
      port: config.proxyPort
    },
    () => {
      log.debug(
        `Equipment client HL7 -> connected to proxy at ${config.proxyHost}:${config.proxyPort}`
      );

      log.debug('Equipment client HL7 -> sent HL7 Example to proxy');

      log.debug('Equipment client HL7 -> sent HL7 acknowledgment to proxy');

      const ack = createAcknowledgment();

      sendHL7Acknowledgment(ack, client);
    }
  );

  client.on('data', (data) => {
    log.debug('Equipment client HL7 -> received data from proxy');
    log.debug(`Equipment client HL7 -> data length: ${data.length} bytes`);
  });

  client.on('error', (err) => {
    log.error('Equipment client HL7 -> error:', err);
    client.destroy(); // Close the connection on error
    scheduleReconnect();
  });

  client.on('close', () => {
    log.debug('Equipment client HL7 -> disconnected');
    scheduleReconnect();
  });

  return client;
};

/**
 * Schedules reconnection after 5 seconds
 */
const scheduleReconnect = () => {
  setTimeout(() => {
    log.debug('Equipment client HL7 -> reconnecting...');
    createEquipmentClientHL7();
  }, 10000);
};

/**
 * Creates and starts the HL7 equipment client
 */
const createEquipmentClientHL7 = () => {
  return createConnection();
};

module.exports = createEquipmentClientHL7;
