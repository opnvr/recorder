const rootFolder = '/home/tim/projects/personal/nvrrecorder/video'
// const rootFolder = '/media/tim/nvr/video'

const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
function videoConsumer (camera) {
    const baseFolder = `${rootFolder}/camera${camera.toString().padStart(2, '0')}`
    fs.mkdirSync(baseFolder, { recursive: true })

    const command = ffmpeg(`rtsp://admin:Milly%20Lola%20810@192.168.1.2${camera.toString().padStart(2, '0')}:554/Streaming/Channels/101`)
        .noAudio()
        .videoCodec('copy')
        .output(`${rootFolder}/camera${camera.toString().padStart(2, '0')}/record_%Y-%m-%dT%H:%M:%S.mp4`)
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
        .on('stderr', function(stderrLine) {
            // console.log('Stderr output: ' + stderrLine);
          })
        .on('error', function (err) {
            console.log('An error occurred: ' + err.message);
        })
        .on('end', function () {
            console.log('Processing finished !');
        });
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
const { resolve, basename, extname } = require('path');
const { readdir } = require('fs').promises;
const { DateTime } = require('luxon')

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function fileCheck () {
    const files = await getFiles(rootFolder)
    console.log(`Found ${files.length} videos the check`)
    files.forEach(path => {
        const datePart = basename(path, extname(path)).substring(7)
        const age = DateTime.fromISO(datePart).diffNow().as('hours')
        if(age < -5) {
          console.log('deleting file ', datePart, age)
          fs.unlinkSync(path)
        }
    })

    setTimeout(fileCheck, 1000 * 10 * 1)
}

setTimeout(fileCheck, 1000 * 10 * 1)
