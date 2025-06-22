# Laboratory TCP Proxy

A robust TCP proxy server for laboratory equipment communication with ASTM and HL7 protocol support.

## 🏗️ Project Structure

```
proxy_for_labs/
├── cli/                          # Command line interfaces
│   ├── proxy-server.js          # Main server CLI
│   ├── lis-simulator.js         # LIS simulator CLI
│   └── help.js                  # Help command
├── src/                         # Source code
│   ├── app.js                   # Main application class
│   ├── core/                    # Core proxy functionality
│   │   ├── tcp-forward-proxy.js
│   │   ├── tcp-reverse-proxy.js
│   │   └── simulate-connection.js
│   ├── simulators/              # Equipment simulators
│   │   ├── simulate-equipment.js
│   │   └── simulate-connection.js
│   ├── communications/          # Protocol handling
│   │   ├── constants/
│   │   │   └── buffers.js       # ASTM/HL7 constants
│   │   ├── helpers/
│   │   │   ├── checksum.js
│   │   │   └── cobas-c-300.js
│   │   └── parsers/
│   │       ├── astm.js          # ASTM parser
│   │       └── hl7.js           # HL7 parser
│   ├── config/                  # Configuration
│   │   └── index.js
│   ├── middleware/              # Express middleware
│   │   ├── get-api-token-by-login.js
│   │   └── send-to-external-api.js
│   └── utils/                   # Utilities
│       ├── logger.js
│       └── messages.js
├── docs/                        # Documentation
├── tools/                       # Development tools (empty after reorganization)
├── index.js                     # Legacy entry point (still works)
└── package.json                 # Package configuration
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Running the Server

#### Using npm scripts (recommended):
```bash
# Start as reverse proxy
IS_REVERSE_PROXY=true npm run server

# Start as forward proxy
IS_FORWARD_PROXY=true npm run server

# Development mode (reverse proxy)
npm run dev

# Show help
npm run help
```

#### Using the legacy entry point:
```bash
# Still works for backward compatibility
IS_REVERSE_PROXY=true node index.js
```

### Running the LIS Simulator
```bash
npm run lis
```
- [Usage](#usage)
- [Proxy Types](#proxy-types)
- [Environment Variables](#environment-variables)
- [Logging](#logging)
- [Development](#development)
- [License](#license)

## Features

- **Dual Proxy Modes**: Forward and reverse TCP proxy configurations
- **Laboratory-Specific**: Optimized for LIS-equipment communication patterns
- **Configurable Logging**: Winston-based logging with file rotation
- **Environment-Based Config**: Flexible configuration via environment variables
- **Error Handling**: Robust error handling and connection management
- **Development Ready**: Hot reload support for development

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│    Proxy    │───▶│   Target    │
│ (Equipment/ │    │   Server    │    │ (LIS/Equip) │
│    LIS)     │◀───│             │◀───│             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd proxy_for_labs
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

## Configuration

Create a `.env` file in the root directory with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# LIS Configuration
LIS_HOST=localhost
LIS_PORT=8080

# Equipment Configuration
EQUIPMENT_HOST=localhost
EQUIPMENT_PORT=9090

# Proxy Settings
PROXY_TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
MAX_REDIRECTS=5

# Logging Configuration
ENABLE_FILE_LOGGING=true
LOG_DIR=./logs
MAX_LOG_FILE_SIZE=10m
MAX_LOG_FILES=5
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Specific Proxy Types
```bash
# Forward Proxy
node src/proxies/tcp-forward-proxy.js

# Reverse Proxy
node src/proxies/tcp-reverse-proxy.js
```

## Proxy Types

### Forward TCP Proxy
Routes client equipment traffic through the proxy to the LIS server.

| Feature           | Configuration                          |
|-------------------|---------------------------------------|
| **Purpose**       | Proxy accepts connection from client (equipment) and forwards to server (LIS) |
| **Traffic Flow**  | Equipment → Proxy → LIS               |
| **Listening Host**| Proxy listens for equipment connections |
| **Target Host**   | LIS server host/port                  |
| **Use Case**      | Equipment connecting through proxy to LIS |

### Reverse TCP Proxy
Routes LIS traffic through the proxy to equipment servers.

| Feature           | Configuration                          |
|-------------------|---------------------------------------|
| **Purpose**       | Proxy accepts connection from LIS and connects to equipment (acting as server) |
| **Traffic Flow**  | LIS → Proxy → Equipment               |
| **Listening Host**| Proxy listens for LIS connections     |
| **Target Host**   | Equipment server host/port            |
| **Use Case**      | LIS initiating requests to equipment servers |

### Comparison Table

| Proxy Type         | Listens for      | Connects to          | Typical Scenario                               |
|--------------------|------------------|---------------------|-----------------------------------------------|
| Forward TCP Proxy   | Equipment (client) | LIS (server)         | Equipment connects through proxy to LIS       |
| Reverse TCP Proxy   | LIS (client)       | Equipment (server)   | LIS connects through proxy to equipment server|

## Environment Variables

### Core Configuration
- `PORT`: Proxy server listening port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

### Connection Settings
- `LIS_HOST`: LIS server hostname
- `LIS_PORT`: LIS server port
- `EQUIPMENT_HOST`: Equipment server hostname
- `EQUIPMENT_PORT`: Equipment server port

### Proxy Behavior
- `PROXY_TIMEOUT`: Connection timeout in milliseconds (default: 30000)
- `RETRY_ATTEMPTS`: Number of retry attempts (default: 3)
- `RETRY_DELAY`: Delay between retries in milliseconds (default: 1000)
- `MAX_REDIRECTS`: Maximum number of redirects (default: 5)

### Logging
- `ENABLE_FILE_LOGGING`: Enable file-based logging (true/false)
- `LOG_DIR`: Log files directory (default: ./logs)
- `MAX_LOG_FILE_SIZE`: Maximum log file size (default: 10m)
- `MAX_LOG_FILES`: Maximum number of log files to keep (default: 5)

## Logging

The proxy uses Winston for structured logging with the following features:

- **Console Output**: Colorized console logging for development
- **File Rotation**: Automatic log file rotation based on size
- **Error Separation**: Separate error log files
- **JSON Format**: Structured JSON logging for production
- **Configurable Levels**: Adjustable log levels via environment variables

Log files are stored in the `logs/` directory:
- `combined.log`: All log messages
- `error.log`: Error messages only

## Development

### Project Structure
```
proxy_for_labs/
├── src/
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── proxies/
│   │   ├── tcp-forward-proxy.js   # Forward proxy implementation
│   │   └── tcp-reverse-proxy.js   # Reverse proxy implementation
│   └── utils/
│       └── logger.js         # Logging utilities
├── logs/                     # Log files directory
├── tests/                    # Test files
├── docs/                     # Documentation
├── .env                      # Environment configuration
├── package.json
└── README.md
```

### Scripts
- `npm start`: Start the proxy server
- `npm run dev`: Start in development mode with hot reload
- `npm test`: Run tests (when implemented)

## License

ISC

