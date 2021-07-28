

const ffmpeg = require('fluent-ffmpeg')
const config = require('./config')

const factory = ({ id, ipAddress }) => {
    const log = require('loglevel').getLogger('recorder-' + id)
    log.debug('Create')

    return {
        start
    }

    async function start () {   
        const command = ffmpeg(`rtsp://admin:Milly%20Lola%20810@${ipAddress}:554/Streaming/Channels/101`)
          .noAudio()
          .videoCodec('copy')
          .output(`${config.output.rootFolder}/${id}/%Y/%m/%d/recording_%Y-%m-%dT%H:%M:%S.mp4`)
          .outputFormat('segment')
          .outputOptions([
            '-strftime 1',
            '-strftime_mkdir 1',
            '-segment_format_options movflags=+faststart+frag_keyframe',
            '-segment_time 00:01:00',
            '-segment_atclocktime 1',
            '-segment_clocktime_offset 30',
            '-segment_format mp4',
            '-reset_timestamps 1'
          ])
          .on('stderr', function (stderrLine) {
            log.debug(stderrLine)
          })
          .on('error', function (err) {
            log.error('Failed to output stream', err)
          })
          .on('end', function () {
            log.warn('Stream ended', id)
          })

        command.run()
      }
}

module.exports = factory