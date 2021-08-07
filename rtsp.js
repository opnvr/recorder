
const ffmpeg = require('fluent-ffmpeg')
const { DateTime } = require('luxon')
const { mkdir } = require('fs').promises
const joi = require('joi')

const CREATEFOLDERSINTERVAL = 1000 * 60 * 1 //30 // 30 mins

const schema = joi.object({
  type: joi.string(),
  id: joi.string().required(),
  uri: joi.string().uri().required(),
  authentication: joi.object({
    enable: joi.boolean().default(true),
    user: joi.string().required(),
    pass: joi.string().required()
  })
})

const factory = (config, itemConfig) => {
  const log = require('loglevel').getLogger('rtsp-' + itemConfig.id)
  log.debug('Create')

  const { value: rtspConfig, error } = schema.validate(itemConfig)
  if (error) {
    throw new Error('Invalid configuration for simpleretention, ' + error.message)
  }

  log.debug('Loaded config', rtspConfig)

  return {
    start
  }

  async function folderCheck () {
    let date = DateTime.local()
    let baseFolder = `${config.output.rootFolder}/${rtspConfig.id}/${date.toFormat('yyyy/MM/dd')}`
    console.log('ensure folder', baseFolder, date.toISO())
    await mkdir(baseFolder, { recursive: true })

    if (date.hour >= 22) {
      date = date.plus({ day: 1 })
      baseFolder = `${config.output.rootFolder}/${rtspConfig.id}/${date.toFormat('yyyy/MM/dd')}`
      console.log('ensure folder (10pm)', baseFolder)
      await mkdir(baseFolder, { recursive: true })
    }
  }

  async function start () {
    await folderCheck()
    setTimeout(() => folderCheck(), CREATEFOLDERSINTERVAL)

    const camUrl = new URL('/Streaming/Channels/101', rtspConfig.uri)
    if (rtspConfig.authentication && rtspConfig.authentication.enable) {
      camUrl.username = rtspConfig.authentication.user
      camUrl.password = rtspConfig.authentication.pass
    }

    log.debug('Camera Uri', camUrl.href)

    const command = ffmpeg()
      .addOption(`-loglevel ${config.logging.ffmpeg}`)
      .input(camUrl.href)
      .audioCodec('copy')
      .videoCodec('copy')
      .output(`${config.output.rootFolder}/${rtspConfig.id}/%Y/%m/%d/recording_%Y-%m-%dT%H:%M:%S.mp4`)
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
        log.debug(stderrLine)
      })
      .on('error', function (err) {
        log.error('Failed to output stream', err)
      })
      .on('end', function () {
        log.warn('Stream ended', rtspConfig.id)
      })

    command.run()
  }
}

module.exports = factory
