const log = require('loglevel')
log.setDefaultLevel('warn')

const prefix = require('loglevel-plugin-prefix')
prefix.reg(log)
prefix.apply(log, {
  format (level, name, timestamp) {
    return `${timestamp} ${level.toUpperCase()} ${name}:`
  }
})

const config = require('./config')
log.info('Create')

// Register source type handlers
const sourceHandlers = new Map()
sourceHandlers.set('RTSP', require('./rtsp'))

config.sources.forEach(source => {
  if (sourceHandlers.has(source.type)) {
    sourceHandlers.get(source.type)(source).start()
  } else {
    throw new Error(`Unhandled source type ${source.type}`)
  }
})

if (config.output.retention) {
  const retention = require('./retention')()
  retention.start()
}
