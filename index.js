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

const recorder = require('./recorder')
config.cameras.forEach(camera => {
  recorder(camera.RTSP).start()
})

if (config.output.retention) {
  const retention = require('./retention')()
  retention.start()
}
