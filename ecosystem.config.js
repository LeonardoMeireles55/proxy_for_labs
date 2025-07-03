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
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_file: './logs/emulator.log',
      out_file: './logs/emulator-out.log',
      error_file: './logs/emulator-error.log',
      time: true,
      merge_logs: true
    },
    {
      name: 'lab-proxy',
      script: './app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_file: './logs/proxy.log',
      out_file: './logs/proxy-out.log',
      error_file: './logs/proxy-error.log',
      time: true,
      merge_logs: true,
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
