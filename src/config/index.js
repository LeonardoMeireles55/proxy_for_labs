require('dotenv').config();

const parseIntOrDefault = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getConfig = () => ({
  port: parseIntOrDefault(process.env.PORT, 3000),

  equipmentHost: process.env.EQUIPMENT_HOST || 'localhost',
  equipmentPort: parseIntOrDefault(process.env.EQUIPMENT_PORT, 9000),

  lisHost: process.env.LIS_HOST || 'localhost',
  lisPort: parseIntOrDefault(process.env.LIS_PORT, 8080),

  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: 'debug',

  proxy: {
    timeout: parseIntOrDefault(process.env.PROXY_TIMEOUT, 30000),
    retryAttempts: parseIntOrDefault(process.env.RETRY_ATTEMPTS, 3),
    retryDelay: parseIntOrDefault(process.env.RETRY_DELAY, 1000),
    maxRedirects: parseIntOrDefault(process.env.MAX_REDIRECTS, 5),
    isReverseProxy: process.env.IS_REVERSE_PROXY === 'true',
    isForwardProxy: process.env.IS_FORWARD_PROXY === 'true',
  },

  logging: {
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDir: process.env.LOG_DIR || './logs',
    maxFileSize: process.env.MAX_LOG_FILE_SIZE || '10m',
    maxFiles: parseIntOrDefault(process.env.MAX_LOG_FILES, 5),
  },

  externalAPI: {
    baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://api.example.com/',

    loginUrl: process.env.EXTERNAL_API_BASE_URL + 'auth/login' || 'https://api.example.com/auth/login',
  },

});

module.exports = getConfig();
