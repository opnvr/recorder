// const rootFolder = '/home/tim/projects/personal/nvrrecorder/video'
const rootFolder = '/video'

// Ensure date based folders exist
const fs = require('fs')
const { DateTime } = require('luxon')

async function folderCheck (camera) {
  let date = DateTime.local()
  let baseFolder = `${rootFolder}/camera${camera.toString().padStart(2, '0')}/${date.year}/${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}`
  console.log('ensure folder', baseFolder)
  await fs.promises.mkdir(baseFolder, { recursive: true })

  if (date.hour >= 23) {
    date = date.plus({ day: 1 })
    baseFolder = `${rootFolder}/camera${camera.toString().padStart(2, '0')}/${date.year}/${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}`
    console.log('ensure folder (11pm)', baseFolder)
    await fs.promises.mkdir(baseFolder, { recursive: true })
  }

  setTimeout(folderCheck.bind(null, camera), 1000 * 60 * 30)
}

const ffmpeg = require('fluent-ffmpeg')

async function videoConsumer (camera) {
  await folderCheck(camera)

  const command = ffmpeg(`rtsp://admin:Milly%20Lola%20810@192.168.1.2${camera.toString().padStart(2, '0')}:554/Streaming/Channels/101`)
    .noAudio()
    .videoCodec('copy')
    .output(`${rootFolder}/camera${camera.toString().padStart(2, '0')}/%Y/%m/%d/recording_%Y-%m-%dT%H:%M:%S.mp4`)
    .outputFormat('segment')
    .outputOptions([
      '-strftime 1',
      '-segment_format_options movflags=+faststart+frag_keyframe',
      '-segment_time 00:01:00',
      '-segment_atclocktime 1',
      '-segment_clocktime_offset 30',
      '-segment_format mp4',
      '-reset_timestamps 1'
    ])
    .on('stderr', function (stderrLine) {
      // console.log('Stderr output: ' + stderrLine);
    })
    .on('error', function (err) {
      console.log('An error occurred: ' + err.message)
    })
    .on('end', function () {
      console.log('Processing finished !')
    })
  command.run()
}

videoConsumer(2)
videoConsumer(3)
videoConsumer(4)
videoConsumer(5)
videoConsumer(6)
videoConsumer(7)
videoConsumer(8)
videoConsumer(9)

// Setup a timeout to check for files that are older than maxAge and delete them
const { resolve, basename, extname } = require('path')
const { readdir } = require('fs').promises

async function getFiles (dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
}

async function fileCheck () {
  const files = await getFiles(rootFolder)
  console.log(`Found ${files.length} videos to check`)
  files.forEach(path => {
    const datePart = basename(path, extname(path)).substring(10)
    console.log('datepart', basename(path, extname(path)), datePart)
    const age = DateTime.fromISO(datePart).diffNow().as('days')
    console.log('age', age)
    if (age < -5) {
      console.log('deleting file ', datePart, age)
      fs.unlinkSync(path)
    }
  })

  setTimeout(fileCheck, 1000 * 60 * 1)
}

setTimeout(fileCheck, 1000 * 60 * 1)

// remove empty folders once a day
const fsPromises = require('fs').promises
const path = require('path')

async function removeEmptyDirectories (directory) {
  // lstat does not follow symlinks (in contrast to stat)
  const fileStats = await fsPromises.lstat(directory)
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
    console.log('Removing: ', directory)
    await fsPromises.rmdir(directory)
  }
}

async function doRemoveEmptyFolders () {
  console.log('removeEmptyFolders')
  await removeEmptyDirectories(rootFolder)

  setTimeout(doRemoveEmptyFolders, 1000 * 60 * 350)
}

setTimeout(doRemoveEmptyFolders, 1000 * 60)
