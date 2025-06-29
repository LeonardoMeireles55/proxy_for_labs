const fs = require("node:fs")
const path = require("node:path")
const log = require("../../configs/logger")

/**
 * Generate unique timestamp for file naming
 * @returns {string} ISO timestamp with milliseconds
 */
const generateTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-')

/**
 * Validate if data is meaningful for saving
 * @param {*} data - Data to validate
 * @returns {boolean} True if data is valid
 */
const isValidData = (data) => {
    if (!data) return false
    if (Array.isArray(data)) return data.length > 0
    if (typeof data === 'object') return Object.keys(data).length > 0
    return Buffer.from(data).byteLength > 2
}

/**
 * Ensure debug directory exists
 */
const ensureDebugDirectory = () => {
    const debugDir = path.join(process.cwd(), 'debug')
    fs.mkdirSync(debugDir, { recursive: true })
    return debugDir
}

/**
 * Generate unique file path to avoid overwrites
 * @param {string} debugDir - Debug directory path
 * @param {string} prefix - File prefix
 * @returns {string} Unique file path
 */
const generateUniqueFilePath = (debugDir, prefix = 'message') => {
    let counter = 0
    let filePath

    do {
        const timestamp = generateTimestamp()
        const suffix = counter > 0 ? `_${counter}` : ''
        filePath = path.join(debugDir, `${prefix}_${timestamp}${suffix}.json`)
        counter++
    } while (fs.existsSync(filePath))

    return filePath
}

/**
 * Write debug data to unique timestamped file
 * @param {string} data - Data to save
 * @param {string} prefix - Optional file prefix
 */
const writeDebugFile = (data, prefix = 'message') => {
    if (!isValidData(data)) {
        log.warn('Invalid data provided, skipping file creation')
        return
    }

    const debugDir = ensureDebugDirectory()
    const filePath = generateUniqueFilePath(debugDir, prefix)

    fs.writeFileSync(filePath, data, { encoding: 'utf8' })
    log.debug(`Debug data saved to ${path.basename(filePath)}`)
}

module.exports = { writeDebugFile }
