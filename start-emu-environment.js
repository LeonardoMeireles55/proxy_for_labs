/**
 * @fileoverview Mock Simulators Startup Module
 * This module provides functionality to start both equipment and LIS simulators
 * simultaneously for testing and development purposes.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */
const config = require('./configs/config');
const log = require('./configs/logger');
const LisServer = require('./src/mocks/lis/lis-server');
const createEquipmentClientHL7 = require('./src/mocks/hl-7/equipment-client-hl7');

/**
 * Validates configuration to prevent conflicts
 * @throws {Error} If configuration is invalid
 */
const validateConfiguration = () => {
  // Check for conflicting client/server configurations
  if (config.lisServerEmu && config.lisClientEmu) {
    throw new Error(
      'Cannot enable both LIS server and LIS client emulation simultaneously'
    );
  }

  if (config.equipmentServerEmu && config.equipmentClientEmu) {
    throw new Error(
      'Cannot enable both equipment server and equipment client emulation simultaneously'
    );
  }

  // Ensure at least one emulator is enabled
  const hasAnyEmulator =
    config.lisServerEmu ||
    config.lisClientEmu ||
    config.equipmentServerEmu ||
    config.equipmentClientEmu;

  if (!hasAnyEmulator) {
    throw new Error('At least one emulator must be enabled');
  }
};

/**
 * Starts LIS server emulator
 */
const startLisServer = () => {
  const lisServer = LisServer().listen(config.lisPort, () => {
    log.debug(`LIS server emu started on port ${config.lisPort}`);
  });

  lisServer.on('error', (err) => {
    log.error(`LIS server error: ${err.message}`);
    throw err;
  });

  return lisServer;
};

/**
 * Starts equipment client emulator
 */
const startEquipmentClient = () => {
  log.debug('Initializing equipment client emu...');
  return createEquipmentClientHL7();
};

/**
 * Gets list of enabled emulators for logging
 */
const getEnabledEmulators = () => {
  const emulators = [];
  const emulatorMap = {
    lisServerEmu: 'LIS Server',
    lisClientEmu: 'LIS Client',
    equipmentServerEmu: 'Equipment Server',
    equipmentClientEmu: 'Equipment Client'
  };

  Object.entries(emulatorMap).forEach(([configKey, name]) => {
    config[configKey] && emulators.push(name);
  });

  return emulators;
};

/**
 * Starts enabled emulators based on configuration
 */
const startEmulators = () => {
  const results = {};

  config.lisServerEmu && (results.lisServer = startLisServer());
  // config.equipmentClientEmu &&
  //   (results.equipmentClient = startEquipmentClient());

  return results;
};

/**
 * Starts both equipment and LIS simulators based on configuration
 * @throws {Error} If any simulator fails to start or configuration is invalid
 */
const initializeMockEnvironment = () => {
  try {
    validateConfiguration();

    const results = startEmulators();

    const enabledEmulators = getEnabledEmulators();
    log.debug(`Enabled emulators: ${enabledEmulators.join(', ')}`);

    return results;
  } catch (error) {
    log.error(`Failed to start simulators: ${error.message}`);
    throw error;
  }
};

// Auto-start simulators when module is run directly
initializeMockEnvironment();

module.exports = initializeMockEnvironment;
