const log = require("./logger")
const fs = require("node:fs")

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

/**
 * Validate if data is meaningful for saving
 * @param {*} data - Data to validate
 * @returns {boolean} True if data is valid
 */
const isValidData = (data) => {
    if (!data) return false

    if (Array.isArray(data)) {
        return data.length > 0
    }

    if (typeof data === 'object') {
        return Object.keys(data).length > 0
    }

    if (Buffer.from(data).byteLength > 2) {
        return true
    }

    return false
  }

/**
 * Save data to debug file with timestamp
 * @param {string} data - JSON string data to save
 */
const saveDataToFile = (data) => {
    if (!data || !isValidData(data)) {
        log.warn('No valid data to save, skipping file creation')
        return
    }

    const filePath = `./debug/message_${timestamp}.json`
    fs.mkdirSync('./debug', { recursive: true })
    fs.writeFileSync(filePath, data, { encoding: 'utf8' })
    log.debug(`Data saved to ${filePath}`)
  }


  module.exports = {
    saveDataToFile
  }
