const { StatusCodes } = require("http-status-codes");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const env =require("../config/environment")
const constants = require("../utils/constants");
const authenticationMiddleware = (req, res, next) => {
  try {
    if (
      constants.PUBLIC_PATH.some((item) => `${constants.BASE_URL_API_VERSION}${item}` === req.originalUrl)
    ) {
      return next();
    }
    const token = req?.cookies?.accessToken;
    if (!token) {
      throw new customError(StatusCodes.UNAUTHORIZED, "Token is required.");
    }

    const user = jwt.verify(token, env.Private_KeyAccessToken);
    req.user = user;
    next();
  } catch (error) {
    console.log(`lỗi authenticationMiddleware:${error}`);
    next(error);
  }
};

module.exports = authenticationMiddleware;
