const config = require('./config');
const log = require('./utils/logger');
const equipmentSimulator = require('./simulators/equipment');
const lisSimulator = require('./simulators/lis');


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

startSimulators()

module.exports = startSimulators;
