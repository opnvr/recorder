
const rootLog = require('loglevel')

const joi = require('joi')

const schema = joi.object({
    cameras: joi.array().items(joi.object({
        RTSP: joi.object({
            id: joi.string().required(),
            ipAddress: joi.string().ip().required()
        }).required()
    })),
    logging: joi.object({
        level: joi.string().allow('debug')
    }),
    output: joi.object({
        rootFolder: joi.string().required(),
        retention: joi.string().isoDuration()
    }).required()
}).required()

const fs = require('fs')
const YAML = require('yaml')

const file = fs.readFileSync('config.yaml', 'utf8')
const { value: config, error } = schema.validate(YAML.parse(file), { abortEarly: false })
if (error) {
    throw new Error('Invalid configuration, ' + error.message)
}

rootLog.setLevel(config.logging.level)
const log = require('loglevel').getLogger('config')

module.exports = config