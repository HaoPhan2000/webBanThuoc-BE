const winston = require("winston");

const banLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({dirname:"logs",filename:"login.log", level: "info"}),
  ],
});

module.exports = banLogger;
