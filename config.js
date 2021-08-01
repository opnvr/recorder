
const rootLog = require('loglevel')

const joi = require('joi')

const schema = joi.object({
  cameras: joi.array().items(joi.object({
    RTSP: joi.object({
      id: joi.string().required(),
      ipAddress: joi.string().ip().required(),
      authentication: joi.object({
        user: joi.string().required(),
        pass: joi.string().required()
      })
    }).required()
  })),
  logging: joi.object({
    level: joi.string().allow('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'),
    ffmpeg: joi.string().allow('quiet', 'panic', 'fatal', 'error', 'warning', 'info', 'verbose', 'debug', 'trace').default('warning')
  }),
  output: joi.object({
    rootFolder: joi.string().required(),
    retention: joi.string().isoDuration()
  }).required()
}).required()

const fs = require('fs')
const YAML = require('yaml')
const { string } = require('joi')

const file = fs.readFileSync('config.yaml', 'utf8')
const { value: config, error } = schema.validate(YAML.parse(file), { abortEarly: false })
if (error) {
  throw new Error('Invalid configuration, ' + error.message)
}

if (config.logging && config.logging.level) {
  rootLog.setLevel(config.logging.level)
}
const log = require('loglevel').getLogger('config')

log.debug('Loaded config', config)

module.exports = config
