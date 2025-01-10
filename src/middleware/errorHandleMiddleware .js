const { StatusCodes } = require("http-status-codes");
const errorHandleMiddleware = (err, req, res, next) => {
  console.log("vào errorHandleMiddleware");
  console.log(err.message)
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    ...(err.details && { details: err.details }),
  };

  return res.status(err.statusCode).json(responseError);
};
module.exports = errorHandleMiddleware;
