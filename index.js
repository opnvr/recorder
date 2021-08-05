const log = require('loglevel')
log.setDefaultLevel('warn')

const prefix = require('loglevel-plugin-prefix')
prefix.reg(log)
prefix.apply(log, {
  format (level, name, timestamp) {
    return `${timestamp} ${level.toUpperCase()} ${name}:`
  },
  timestampFormatter (date) {
    return date.toISOString()
  }
})

const config = require('./config')
log.info('Create')

// Register source type handlers
const sourceHandlers = new Map()
sourceHandlers.set('RTSP', require('./rtsp'))

config.sources.forEach(source => {
  if (sourceHandlers.has(source.type)) {
    sourceHandlers.get(source.type)(config, source).start()
  } else {
    throw new Error(`Unhandled source type ${source.type}`)
  }
})

// Register retention type handlers
const retentionHandlers = new Map()
retentionHandlers.set('simple', require('./simpleretention'))

if (config.output.retention) {
  if (retentionHandlers.has(config.output.retention.type)) {
    retentionHandlers.get(config.output.retention.type)(config, config.output.retention).start()
  } else {
    throw new Error(`Unhandled source type ${config.output.retention.type}`)
  }
}
