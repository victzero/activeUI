/**
 * [log description]
 * 日志等级信息.
 * @type {Object}
 */
var log = {
  config: { // 默认配置.
    info: true,
    warn: true,
    debug: true,
    error: true,
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
  error: function(mess) {
    log.config.error && console.error(mess);
  }
};
//自定义配置.
log.config.info = true;
log.config.warn = true;
log.config.debug = false;
