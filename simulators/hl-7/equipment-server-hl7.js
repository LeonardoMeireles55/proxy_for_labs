/**
 * @fileoverview Laboratory Equipment Simulator
 * This module simulates a laboratory equipment device that communicates using HL7 protocol.
 *
 * @author Leonardo Meireles
 * @version 1.0.0
 */

const net = require('node:net')
const log = require('../../helpers/logging/logger')
const { ASTM } = require('../../proxy/utils')

const mockCobasMessage = `MSH|^~\\&|COBAS|COBAS|LIS|LIS|20231010120000||ORU^R01|1234567890|P|2.5
PID|1||123456^^^LIS^MR||DOE^JOHN^A||19800101|M|||123 MAIN ST^^CITY^ST^12345||(555)555-5555|||EN|S||123456789|987654321
ORC|RE|1234567890|987654321||||20231010120000|||F
OBR|1|1234567890|987654321||TEST^TEST DESCRIPTION^L|||20231010120000|||||||||||||||||||F
OBX|1|NM|TEST_CODE^TEST NAME^L||42.0|mg/dL|0-100|N|||F`

/**
 * Creates a laboratory equipment simulator server
 * The simulator accepts client connections
 *
 * @function createEquipmentServerHL7
 * @returns {import('net').Server} TCP server instance that simulates laboratory equipment
 */
const createEquipmentServerHL7 = () => {

    return net.createServer((socket) => {

        log.info(`Equipment server -> new client connected: ${socket.remoteAddress}`)

        socket.write(Buffer.from(mockCobasMessage + '\r\n'))

        socket.on('data', (data) => {
            log.info(`Equipment server -> received data: ${data.toString('utf8')}`)
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
