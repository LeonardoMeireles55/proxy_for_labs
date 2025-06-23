/**
 * @fileoverview Mock Simulators Startup Module
 * This module provides functionality to start both equipment and LIS simulators
 * simultaneously for testing and development purposes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const config = require('./config');
const log = require('./utils/logger');
const equipmentSimulator = require('./simulators/equipment');
const lisSimulator = require('./simulators/lis');

/**
 * Simulator startup result
 * @typedef {Object} SimulatorResult
 * @property {import('net').Server} equipmentServer - The started equipment simulator server
 * @property {Object} lisClient - The LIS simulator client connection
 */

/**
 * Starts both equipment and LIS simulators concurrently
 * Useful for testing scenarios where both simulators need to run together
 *
 * @async
 * @function startSimulators
 * @returns {Promise<SimulatorResult>} Promise that resolves to simulator instances
 * @throws {Error} If any simulator fails to start
 */
const startSimulators = () => {
  return new Promise((resolve, reject) => {
    try {
      const equipmentServer = equipmentSimulator().listen(config.equipmentPort, () => {
        log.info(`Equipment simulator listening on port ${config.equipmentPort}`);
      });

    const lisClient = lisSimulator(config).connectToProxy();

    resolve({ equipmentServer, lisClient });
    } catch (error) {
      reject(error);
    }
  });

}

// Auto-start simulators when module is run directly
startSimulators()

module.exports = startSimulators;
