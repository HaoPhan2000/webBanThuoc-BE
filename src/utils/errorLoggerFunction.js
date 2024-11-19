const errorLogger =require("../loggers/errorLogger")
const logErrorDetails = (action,req) => {
    errorLogger.error({
      action: action,
      email: req.user.email,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    });
  };
module.exports=logErrorDetails