const net = require('node:net')
const log = require('../utils/logger')
const env = require('../config')
const { asciiBuffers } = require('../communications/constants/buffers')
const { convertAstmToJson } = require('../communications/parsers/astm')

const simulateConnection = () => {
    const client = net.createConnection({
        host: env.lisHost,
        port: env.lisPort
    }, () => {
        log.debug(`Connected to EQUIPMENT server at ${env.equipmentHost}:${env.equipmentPort}`)
    })

    client.on('data', (data) => {
        log.debug('Data received from EQUIPMENT:', data.toString())

        if (data[0] === asciiBuffers.ENQ) {
            log.debug('Received ENQ from LIS, sending ACK')
            client.write(Buffer.from([asciiBuffers.ACK]))
        }

        convertAstmToJson(data.toString())
    })

    client.on('error', (err) => {
        log.error('Connection error:', err.message)
    })

    client.on('close', () => {
        log.debug('Connection to EQUIPMENT closed')
    })

    return client
}

module.exports = simulateConnection
