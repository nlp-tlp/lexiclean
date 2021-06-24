const { format, createLogger, transports, transport } = require('winston');
const { timestamp, combine, printf, colorize, errors, json } = format;

const devLogFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  format: combine(
    //   colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
      errors({stack: true}),
      json()
      ),
  defaultMeta: { service: 'user-service' },
  transports: [
      new transports.Console(),
      new transports.File({ filename: './logger/logs.json'})
  ],
});

module.exports = logger;