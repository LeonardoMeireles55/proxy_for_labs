#!/usr/bin/env node

/**
 * @fileoverview Help and Usage Documentation CLI
 * This module provides command-line help and usage instructions
 * for the Laboratory Tools TCP Proxy system.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const log = require('./utils/logger');

/**
 * Displays comprehensive help information for the Laboratory Tools CLI
 * Shows available commands, environment configuration options, and workflow examples
 * for both forward and reverse proxy modes.
 */
log.info('🧪 Laboratory Tools CLI');
log.info('========================');
log.info('');
log.info('Available commands:');
log.info('  npm run server       - Start the proxy server (forward or reverse)');
log.info('  npm run lis          - Start the LIS simulator (interactive)');
log.info('  npm run equipment    - Start the equipment simulator');
log.info('  npm run connection   - Start the connection simulator');
log.info('  npm run help         - Show this help message');
log.info('');
log.info('Environment Configuration:');
log.info('  IS_REVERSE_PROXY     - Set to true for reverse proxy mode');
log.info('  IS_FORWARD_PROXY     - Set to true for forward proxy mode');
log.info('  PORT                 - Server port (default: 3000)');
log.info('  EQUIPMENT_PORT       - Equipment simulation port (default: 9000)');
log.info('  EQUIPMENT_HOST       - Equipment host (default: localhost)');
log.info('  LIS_PORT             - LIS port (default: 8080)');
log.info('  LIS_HOST             - LIS host (default: localhost)');
log.info('');
log.info('Workflow Examples:');
log.info('  # 1. Start reverse proxy server');
log.info('  IS_REVERSE_PROXY=true npm run server');
log.info('');
log.info('  # 2. In another terminal, start equipment simulator');
log.info('  npm run equipment');
log.info('');
log.info('  # 3. In another terminal, start connection simulator');
log.info('  npm run connection');
log.info('');
log.info('  # 4. In another terminal, start LIS simulator for testing');
log.info('  npm run lis');
log.info('');
log.info('Forward Proxy Example:');
log.info('  # Start forward proxy');
log.info('  IS_FORWARD_PROXY=true npm run server');
log.info('');
log.info('  # Connect LIS simulator directly');
log.info('  npm run lis');
log.info('');
