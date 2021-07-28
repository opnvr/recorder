// Ensure date based folders exist
const fs = require('fs')
const { DateTime } = require('luxon')
const config = require('./config')

async function folderCheck (id) {
    let date = DateTime.local()
    let baseFolder = `${config.output.rootFolder}/${id}/${date.year}/${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}`
    console.log('ensure folder', baseFolder)
    await fs.promises.mkdir(baseFolder, { recursive: true })
    
    if (date.hour >= 23) {
        date = date.plus({ day: 1 })
        baseFolder = `${config.output.rootFolder}/${id}/${date.year}/${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}`
        console.log('ensure folder (11pm)', baseFolder)
        await fs.promises.mkdir(baseFolder, { recursive: true })
    }
    
    setTimeout(folderCheck.bind(null, id), 1000 * 60 * 30)
}

module.exports = folderCheck