const winston = require("winston");

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ dirname: "logs", filename: "error.log", level: "error",}),
  ],
});

module.exports = errorLogger;
