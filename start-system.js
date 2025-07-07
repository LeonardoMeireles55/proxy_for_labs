#!/usr/bin/env node

/**
 * @fileoverview Sequential Startup Script
 * This script ensures proper startup sequence: emulator first, then proxy.
 * It includes health checks and retry logic for robust initialization.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const { spawn } = require('child_process');
const path = require('path');
const log = require('./configs/logger');

/**
 * Configuration for startup sequence
 */
const STARTUP_CONFIG = {
  emulator: {
    script: './start-emu-environment.js',
    name: 'Lab Emulator',
    healthCheckDelay: 3000,
    maxRetries: 3
  },
  proxy: {
    script: './app.js',
    name: 'Lab Proxy',
    startDelay: 5000,
    maxRetries: 3
  }
};

/**
 * Spawns a Node.js process and returns a promise
 * @param {string} scriptPath - Path to the script to run
 * @param {string} processName - Name for logging
 * @returns {Promise<object>} Promise that resolves with the child process
 */
const spawnNodeProcess = (scriptPath, processName) => {
  return new Promise((resolve, reject) => {
    log.info(`Starting ${processName}...`);

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('spawn', () => {
      log.info(
        `${processName} process spawned successfully (PID: ${child.pid})`
      );
      resolve(child);
    });

    child.on('error', (error) => {
      log.error(`Failed to start ${processName}: ${error.message}`);
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (code !== 0) {
        log.error(
          `${processName} exited with code ${code} and signal ${signal}`
        );
      } else {
        log.info(`${processName} exited successfully`);
      }
    });
  });
};

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempts to start a process with retry logic
 * @param {object} config - Process configuration
 * @returns {Promise<object>} The spawned process
 */
const startProcessWithRetry = async (config) => {
  let attempts = 0;

  while (attempts < config.maxRetries) {
    try {
      attempts++;
      log.info(
        `Attempt ${attempts}/${config.maxRetries} to start ${config.name}`
      );

      const process = await spawnNodeProcess(config.script, config.name);

      // Wait for process to stabilize
      if (config.healthCheckDelay) {
        await delay(config.healthCheckDelay);
      }

      return process;
    } catch (error) {
      log.error(`Attempt ${attempts} failed: ${error.message}`);

      if (attempts >= config.maxRetries) {
        throw new Error(
          `Failed to start ${config.name} after ${config.maxRetries} attempts`
        );
      }

      // Wait before retry
      await delay(2000);
    }
  }
};

/**
 * Main startup sequence
 */
const startupSequence = async () => {
  const processes = [];

  try {
    log.info('=== Starting Laboratory System ===');

    // Step 1: Start emulator
    log.info('Phase 1: Starting laboratory emulator...');
    const emulatorProcess = await startProcessWithRetry(
      STARTUP_CONFIG.emulator
    );
    processes.push(emulatorProcess);

    // Step 2: Wait before starting proxy
    log.info(
      `Waiting ${STARTUP_CONFIG.proxy.startDelay}ms before starting proxy...`
    );
    await delay(STARTUP_CONFIG.proxy.startDelay);

    // Step 3: Start proxy
    log.info('Phase 2: Starting laboratory proxy...');
    const proxyProcess = await startProcessWithRetry(STARTUP_CONFIG.proxy);
    processes.push(proxyProcess);

    log.info('=== Laboratory System Started Successfully ===');
    log.info(`Emulator PID: ${emulatorProcess.pid}`);
    log.info(`Proxy PID: ${proxyProcess.pid}`);

    return processes;
  } catch (error) {
    log.error(`Startup sequence failed: ${error.message}`);

    // Cleanup any started processes
    processes.forEach((proc) => {
      if (proc && proc.pid) {
        log.info(`Cleaning up process ${proc.pid}`);
        proc.kill('SIGTERM');
      }
    });

    throw error;
  }
};

/**
 * Graceful shutdown handler
 */
const setupShutdownHandlers = (processes) => {
  const shutdown = (signal) => {
    log.info(`Received ${signal}. Shutting down laboratory system...`);

    processes.forEach((proc, index) => {
      if (proc && proc.pid) {
        const name = index === 0 ? 'Emulator' : 'Proxy';
        log.info(`Stopping ${name} (PID: ${proc.pid})`);
        proc.kill('SIGTERM');
      }
    });

    // Force exit after 10 seconds if processes don't stop gracefully
    setTimeout(() => {
      log.warn('Force exiting...');
      process.exit(1);
    }, 10000);
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
};

// Execute startup sequence
if (require.main === module) {
  startupSequence()
    .then(setupShutdownHandlers)
    .catch((error) => {
      log.error('Failed to start laboratory system:', error.message);
      process.exit(1);
    });
}

module.exports = { startupSequence };
