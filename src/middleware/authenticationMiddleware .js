const { StatusCodes } = require("http-status-codes");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const env = require("../config/environment");
const redisFunction = require("../utils/redisFunction");
const constants = require("../utils/constants");
const authenticationMiddleware =async (req, res, next) => {
  try {
    console.log("authenticationMiddleware nè");
    const { pathname } = new URL(req.originalUrl, `http://${req.headers.host}`);
    console.log(pathname);
    if (
      constants.PUBLIC_PATH.some((item) => {
        return `${constants.BASE_URL_API_VERSION}${item}` === pathname;
      })
    ) {
      return next();
    }
    const token = req?.cookies?.accessToken;
    if (!token) {
      throw new customError(StatusCodes.UNAUTHORIZED, "Token is required");
    }
    const isBlacklisted = await redisFunction.isBlacklisted(token);
    if(isBlacklisted===1){
      throw new customError(StatusCodes.FORBIDDEN, "Token has been banned");
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
