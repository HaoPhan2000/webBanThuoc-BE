const constants = require("../utils/constants");
const authorization = require("../models/authorizationModel");
const customError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const authorizationMiddleware = (req, res, next) => {
  try {
    const { pathname } = new URL(req.originalUrl, `http://${req.headers.host}`);
    if (
      constants.PUBLIC_PATH.some(
        (item) => `${constants.BASE_URL_API_VERSION}${item}` === pathname
      )
    ) {
      return next();
    }

    const role = req?.user?.role;

    if (!role)
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");

    const allowedPaths = authorization[role];
    if (!allowedPaths)
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");

    if (
      !allowedPaths.includes(
        req.path.split(constants.BASE_URL_API_VERSION)?.[1]
      )
    )
      throw new customError(StatusCodes.FORBIDDEN, "Permission denined");

    next();
  } catch (error) {
    console.log(`lỗi authorizationMiddleware:${error}`);

    next(error);
  }
};
module.exports = authorizationMiddleware;
