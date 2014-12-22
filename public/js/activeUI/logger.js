/**
 * [log description]
 * 日志等级信息.
 * @type {Object}
 */
var log = {
  config: {
    info: true,
    warn: true,
    debug: true,
  },
  info: function(mess) {
    log.config.info && console.info(mess)
  },
  warn: function(mess) {
    log.config.warn && console.warn(mess)
  },
  debug: function(mess) {
    log.config.debug && console.debug(mess)
  },
}
// 默认配置.
log.config.info = true;
log.config.warn = true;
log.config.debug = false;
