const net = require('node:net')

const simulateEquipmentServer = net.createServer((socket) => {
    console.log('New client connected:', socket.remoteAddress)

    // Send initial ENQ to simulate equipment request
    socket.write(Buffer.from([0x05])) // ASCII ENQ

    socket.on('data', (data) => {
        console.log('Data received from client:', data.toString())

        if (data[0] === 0x05) { // ASCII ENQ
            console.log('Received ENQ, sending ACK')
            socket.write(Buffer.from([0x06])) // ASCII ACK
        }

        // Simulate sending a response back to the client
        socket.write(Buffer.from([0x06])) // ASCII ACK
    })

    socket.on('error', (err) => {
        console.error('Socket error:', err.message)
    })

    socket.on('close', () => {
        console.log('Client disconnected')
    })
})

// Handle server shutdown gracefully
simulateEquipmentServer.on('close', () => {
    console.log('Equipment simulator server closed')
})

module.exports = simulateEquipmentServer
