/**
 * @fileoverview PM2 Ecosystem Configuration
 * This configuration file defines the startup sequence and management
 * for the laboratory proxy system components.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

module.exports = {
  apps: [
    {
      name: 'lab-emulator',
      script: './start-emu-environment.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    },
    {
      name: 'lab-proxy',
      script: './app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      // Start delay to ensure emulator starts first
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
