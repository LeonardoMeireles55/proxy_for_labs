const net = require('node:net')
const log = require('../utils/logger')
const env = require('../config')


const TCPForwardProxy = net.createServer((clientSocket) => {

    log.debug('Established a new connection from client:', clientSocket.remoteAddress)

    const targetSocket = net.createConnection({ host: env.lisHost, port: env.lisPort }, () => {

        log.debug(`Connected to target server at ${env.lisHost}:${env.lisPort}`)
        targetSocket.on("data", (data) => {

            log.debug('Forwarding data received from the target server, write it back to the client')
            clientSocket.write(data)
        })

        clientSocket.on("data", (data) => {

            log.debug('Forwarding data received from the client, write it back to the target server')
            targetSocket.write(data)
        })
    })

    targetSocket.on('error', (err) => {
        log.error('Error connecting to target:', err)
        clientSocket.end()
    })

    clientSocket.on('error', (err) => {
        log.error('Client socket error:', err)
        targetSocket.end()
    })
})

module.exports = TCPForwardProxy
