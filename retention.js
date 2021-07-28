const log = require('loglevel').getLogger('retention')
const { resolve, basename, extname } = require('path')
const { readdir, lstat, rmdir } = require('fs').promises
const { unlinkSync } = require('fs')
const { DateTime, Duration } = require('luxon')
const path = require('path')
const config = require('./config')

const FILEAGEINTERVAL = 1000 * 60 * 1
const EMPTYFOLDERINTERVAL = 1000 * 60 * 350

const factory = () => {
    log.debug('Create')

    const maxAge = Duration.fromISO(config.output.retention).as('seconds')

    return {
        start
    }

    function start() {
        setTimeout(fileCheck, FILEAGEINTERVAL)
        setTimeout(doRemoveEmptyFolders, EMPTYFOLDERINTERVAL)
    }

    async function getFiles(dir) {
        const dirents = await readdir(dir, { withFileTypes: true })
        const files = await Promise.all(dirents.map((dirent) => {
            const res = resolve(dir, dirent.name)
            return dirent.isDirectory() ? getFiles(res) : res
        }))
        return Array.prototype.concat(...files)
    }

    async function fileCheck() {
        try {
            const files = await getFiles(config.output.rootFolder)
            log.debug(`Found ${files.length} videos to check`)

            files.forEach(path => {
                const datePart = basename(path, extname(path)).substring(10)
                log.debug('datepart', basename(path, extname(path)), datePart)
                const age = DateTime.local().diff(DateTime.fromISO(datePart)).as('seconds')

                log.debug('age', age, maxAge)
                if (age > maxAge) {
                    log.debug('deleting file ', datePart, age)
                    unlinkSync(path)
                }
            })
        } catch (err) {
            log.error('Failed in fileCheck', err)
        }

        setTimeout(fileCheck, FILEAGEINTERVAL)
    }

    async function removeEmptyDirectories(directory) {
        // lstat does not follow symlinks (in contrast to stat)
        const fileStats = await lstat(directory)
        if (!fileStats.isDirectory()) {
            return
        }
        let fileNames = await fsPromises.readdir(directory)
        if (fileNames.length > 0) {
            const recursiveRemovalPromises = fileNames.map(
                (fileName) => removeEmptyDirectories(path.join(directory, fileName))
            )
            await Promise.all(recursiveRemovalPromises)

            // re-evaluate fileNames; after deleting subdirectory
            // we may have parent directory empty now
            fileNames = await fsPromises.readdir(directory)
        }

        if (fileNames.length === 0) {
            log.debug('Removing: ', directory)
            await rmdir(directory)
        }
    }

    async function doRemoveEmptyFolders() {
        log.debug('removeEmptyFolders')
        await removeEmptyDirectories(config.output.rootFolder)

        setTimeout(doRemoveEmptyFolders, EMPTYFOLDERINTERVAL)
    }
}

module.exports = factory
