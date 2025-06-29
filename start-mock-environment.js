/**
 * @fileoverview Mock Simulators Startup Module
 * This module provides functionality to start both equipment and LIS simulators
 * simultaneously for testing and development purposes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */
const config = require("./configs/config")
const log = require("./configs/logger")
const LisServer = require('./src/mocks/lis/lis-server')
const createEquipmentClientHL7 = require('./src/mocks/hl-7/equipment-client-hl7')



/**
 * Simulator startup result
 * @typedef {Object} SimulatorResult
 * @property {Object} equipmentClient - The started equipment simulator client
 * @property {Object} lisServer - The LIS simulator client connection
 */

/**
 * Starts both equipment and LIS simulators concurrently
 * Useful for testing scenarios where both simulators need to run together
 *
 * @function initializeMockEnvironment
 * @throws {Error} If any simulator fails to start
 */
const initializeMockEnvironment = () => {

  createEquipmentClientHL7();

    // try {
    //   const lisServer = LisServer().listen(config.lisPort, () => {

    //     log.debug(`LIS simulator started on port ${config.lisPort}`);
    //     // log.debug('Initializing equipment client...');

    //     // createEquipmentClientHL7();

    //   });

    //   lisServer.on('error', (err) => {
    //     log.error(`LIS server error: ${err.message}`);
    //   });

    // } catch (error) {
    //   log.error(`Failed to start simulators: ${error.message}`);
    // }
  }

// Auto-start simulators when module is run directly
initializeMockEnvironment()

module.exports = initializeMockEnvironment
