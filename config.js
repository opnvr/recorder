
const rootLog = require('loglevel')

const joi = require('joi')

const schema = joi.object({
  sources: joi.array().items(joi.object({
    type: joi.string().allow('RTSP').required()
  }).unknown(true)),
  logging: joi.object({
    level: joi.string().allow('trace', 'debug', 'info', 'warn', 'error', 'silent').default('warn'),
    ffmpeg: joi.string().allow('quiet', 'panic', 'fatal', 'error', 'warning', 'info', 'verbose', 'debug', 'trace').default('warning')
  }),
  output: joi.object({
    rootFolder: joi.string().required(),
    retention: joi.object({
      type: joi.string().allow('simple').required()
    }).unknown(true).required(true)
  }).required()
}).required()

const fs = require('fs')
const YAML = require('yaml')

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
