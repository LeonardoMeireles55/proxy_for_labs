/**
 * @fileoverview TCP Forward Proxy implementation
 * This module creates a forward proxy server that accepts client connections
 * and forwards them to a target LIS (Laboratory Information System) server.
 */

const net = require('node:net');
const { handleBuffer } = require('../handlers/hl7');
const log = require('../../configs/logger');
const config = require('../../configs/config');

const RECONNECT_INTERVAL = 5000; // 5 segundos

/**
 * Create and manage persistent connection to LIS server with auto-reconnect
 */
const createLISConnection = (config, clientSocket) => {
  let targetSocket;
  let reconnectTimer;
  let isConnecting = false;

  const cleanup = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    isConnecting = false;
  };

  const destroyConnection = () => {
    cleanup();
    if (targetSocket && !targetSocket.destroyed) {
      targetSocket.destroy();
    }
  };

  const scheduleReconnect = () => {
    if (clientSocket?.destroyed) return;

    cleanup();
    log.debug(
      `ForwardProxy -> Scheduling LIS reconnection in ${
        RECONNECT_INTERVAL / 1000
      } seconds`
    );
    reconnectTimer = setTimeout(connect, RECONNECT_INTERVAL);
  };

  const setupTargetSocketHandlers = (socket) => {
    socket.on('connect', () => {
      log.debug(
        `ForwardProxy -> Connected to LIS server at ${config.lisHost}:${config.lisPort}`
      );
      cleanup();
    });

    socket.on('data', (data) => {
      handleBuffer(data, clientSocket);
    });

    socket.on('close', () => {
      log.debug('ForwardProxy -> LIS server disconnected');
      scheduleReconnect();
    });

    socket.on('error', (err) => {
      log.error('ForwardProxy -> LIS connection error:', err);
      scheduleReconnect();
    });
  };

  const connect = () => {
    if (clientSocket?.destroyed) return null;

    if (isConnecting) {
      log.debug('ForwardProxy -> Connection attempt already in progress');
      return targetSocket;
    }

    isConnecting = true;
    log.debug('ForwardProxy -> Attempting to connect to LIS');

    targetSocket = net.createConnection({
      host: config.lisHost,
      port: config.lisPort
    });

    setupTargetSocketHandlers(targetSocket);

    return targetSocket;
  };

  clientSocket.once('close', destroyConnection);
  clientSocket.once('error', destroyConnection);

  return connect();
};

/**
 * Forward client data to target LIS server
 */
const forwardToTarget = (data, targetSocket, clientSocket) => {
  if (!targetSocket || targetSocket.destroyed) {
    log.warn('ForwardProxy -> Cannot forward data: target socket unavailable');
    return createLISConnection(config, clientSocket);
  }
  try {
    log.debug(
      `ForwardProxy -> Received data from LIS ${
        targetSocket.remoteAddress || config.lisHost
      }, forwarding to Client ${clientSocket.remoteAddress}`
    );
    handleBuffer(data, targetSocket);
  } catch (error) {
    log.error('ForwardProxy -> Error forwarding client data:', error);
    return createLISConnection(config, clientSocket);
  }

  return targetSocket;
};

/**
 * Handle client connection
 */
const handleClientConnection = (clientSocket) => {
  const clientIP = clientSocket.remoteAddress || 'unknown';
  log.debug(`ForwardProxy -> Client connected: ${clientIP}`);

  let targetSocket = createLISConnection(config, clientSocket);

  clientSocket.on('data', (data) => {
    log.debug(
      `ForwardProxy -> Received data from Client ${clientIP}, forwarding to LIS ${
        targetSocket.remoteAddress || config.lisHost
      }`
    );
    targetSocket = forwardToTarget(data, targetSocket, clientSocket);
  });

  clientSocket.on('close', () => {
    log.debug('ForwardProxy -> Client disconnected');
  });

  clientSocket.on('error', (err) => {
    log.error('ForwardProxy -> Client error:', err);
    clientSocket.destroy();
  });
};

/**
 * Start forward proxy server
 */
const startForwardProxy = (config) => {
  const server = net.createServer(handleClientConnection);

  server.on('error', (err) => {
    log.error('ForwardProxy -> Proxy server error:', err);
  });

  server.listen(config.proxyPort, () => {
    log.debug('ForwardProxy -> Waiting for connections...');
  });

  return server;
};

module.exports = { startForwardProxy };
