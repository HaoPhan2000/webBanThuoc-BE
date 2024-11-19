const constants = require("../utils/constants");
const authorization = require("../models/authorizationModel");
const customError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const authorizationMiddleware = (req, res, next) => {
  try {
  console.log("vào authorizationMiddleware")
  if ( constants.PUBLIC_PATH.some((item) => `${constants.BASE_URL_API_VERSION}${item}` === req?.originalUrl))
    {
      return next();
    }
    const role = req?.user?.role;
    if (!role)
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");
    const allowedPaths = authorization.role;
    if (!allowedPaths)
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");
    if (!allowedPaths.includes(req.path.split(BASE_URL_API_VERSION)?.[1]))
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = authorizationMiddleware;
