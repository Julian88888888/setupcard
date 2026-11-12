import log from 'electron-log'

/**
 * Application logger (electron-log).
 * Writes to console in dev and to a rotating file under userData/logs in production.
 */
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

export const logger = log
