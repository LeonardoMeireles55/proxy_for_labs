const net = require('node:net')
const log =  require('../utils/logger')
const env = require('../config')
const { asciiBuffers } = require('../communications/constants/buffers')

const tcpReverseProxy = net.createServer((lisSocket) => {
  log.debug('LIS connected:', lisSocket.remoteAddress)

  const equipmentSocket = net.createConnection(
    { host: env.equipmentHost, port: env.equipmentPort },
    () => {
      log.debug(`Connected to equipment server at ${env.equipmentHost}:${env.equipmentPort}`)

      equipmentSocket.on('data', (data) => {
        log.debug('Forwarding data from equipment to LIS')

        if (data[0] === asciiBuffers.ACK) {
          log.debug('Received ENQ from equipment, sending ACK to LIS')
          lisSocket.write(Buffer.from([asciiBuffers.ACK]))
        }

        lisSocket.write(data)
      })

      lisSocket.on('data', (data) => {
        log.debug('Forwarding data from LIS to equipment')
        equipmentSocket.write(data)
      })
    }
  )

  equipmentSocket.on('error', (err) => {
    log.error('Equipment socket error:', err)
    lisSocket.end()
  })

  lisSocket.on('error', (err) => {
    log.error('LIS socket error:', err)
    equipmentSocket.end()
  })

  lisSocket.on('end', () => {
    log.debug('LIS disconnected')
    equipmentSocket.end()
  })

  equipmentSocket.on('end', () => {
    log.debug('Equipment disconnected')
    lisSocket.end()
  })
})

module.exports = tcpReverseProxy

