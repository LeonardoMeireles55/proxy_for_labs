/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using HL7 protocol.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../../../configs/logger')


/**
 * Creates a laboratory equipment simulator server
 * The simulator accepts client connections
 *
 * @function createEquipmentServerHL7
 * @returns {import('net').Server} TCP server instance that simulates laboratory equipment
 */
const createEquipmentServerHL7 = () => {

    return net.createServer((socket) => {

        log.debug(`Equipment server -> new client connected: ${socket.remoteAddress}`)

        socket.write(Buffer.from('\r\n'))

        socket.on('data', (data) => {
            log.debug(`Equipment server -> received data: ${data.toString('utf8')}`)
        })

        socket.on('error', (err) => {
            log.error(err)
        })

        socket.on('close', () => {
            log.warn('Equipment server -> client disconnected')
        })
    })
}

module.exports = createEquipmentServerHL7
