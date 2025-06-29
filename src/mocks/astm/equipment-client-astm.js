const net = require('node:net');
const log = require('../../helpers/logging/logger');
const { ASTM } = require('../../proxy/utils');
const config = require('../../config');

/**
 * ASTM message handlers
 */
const messageHandlers = {
  [ASTM.ENQ]: (equipment) => {
    log.debug('Equipment client -> received ENQ, sending ACK');
    equipment.write(Buffer.from([ASTM.ACK]));
  },

  [ASTM.ACK]: () => {
    log.debug('Equipment client -> received ACK, ready for data transmission');
  },

  [ASTM.EOT]: (equipment) => {
    log.debug('Equipment client -> received EOT, closing connection');
    equipment.end();
  }
};

/**
 * Handles incoming data from the proxy
 */
const handleData = (equipment, data) => {
  const messageType = data[0];

  if (messageType === null || messageType === undefined) {
    log.warn('Equipment client -> received empty data, sending NAK');

    return equipment.write(Buffer.from([ASTM.NAK]));
  }

  const handler = messageHandlers[messageType];

  if (handler) {
    return handler(equipment);
  }

  log.debug('Equipment client -> echoing data back');

  equipment.write(Buffer.from([ASTM.ACK]));
};

/**
 * Creates connection to proxy server
 */
const createConnection = () => {
  const equipment = net.connect(
    {
      host: config.proxyHost,
      port: config.proxyPort
    },
    () => {
      log.debug(
        'Equipment client -> connected, sending ENQ to start communication'
      );
      equipment.write(Buffer.from([ASTM.ENQ]));
    }
  );

  equipment.on('data', (data) => handleData(equipment, data));

  equipment.on('error', (err) => {
    log.error('Equipment client -> error:', err);
    scheduleReconnect();
  });

  equipment.on('close', () => {
    log.debug('Equipment client -> disconnected');
    scheduleReconnect();
  });

  return equipment;
};

/**
 * Schedules reconnection after 5 seconds
 */
const scheduleReconnect = () => {
  setTimeout(() => {
    log.debug('Equipment client -> reconnecting...');
    createEquipmentClientASTM();
  }, 5000);
};

/**
 * Creates and starts the ASTM equipment client
 */
const createEquipmentClientASTM = () => {
  return createConnection();
};

module.exports = createEquipmentClientASTM;
