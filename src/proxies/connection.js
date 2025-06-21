const net = require('node:net')
const log = require('../utils/logger')
const env = require('../config')
const hl7Buffers = require('../communications/constants/buffers')
const { convertAstmToJson } = require('../communications/parsers/astm')

    const Connection = net.createConnection({
        host: env.lisHost,
        port: env.lisPort
    }, () => {
        log.debug(`Connected to equipment server at ${env.equipmentHost}:${env.equipmentPort}`)

        Connection.on('data', (data) => {
            log.debug('data received from equipment:', data.toString())

            if (data[0] === hl7Buffers.ENQ) {
                log.debug('Received ENQ from equipment, sending ACK to Equipment')
                Connection.write(Buffer.from([hl7Buffers.ACK]))
            }
            log.debug('Data received from equipment:', data.toString())
            convertAstmToJson(data.toString())
        })
    })

module.exports = Connection
