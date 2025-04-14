const { StatusCodes } = require("http-status-codes");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const env = require("../config/environment");
const redisService = require("../services/redisService");
const constants = require("../utils/constants");
const authenticationMiddleware = async (req, res, next) => {
  try {
    console.log("authenticationMiddleware nè");
    const  pathname = req.path
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
    const isBlacklisted = await redisService.isBlacklisted(token);
    if (isBlacklisted === 1) {
      throw new customError(StatusCodes.FORBIDDEN, "Token has been banned");
    }
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, env.Private_KeyAccessToken, (err, payload) => {
        if (err) {
          return reject( new customError(StatusCodes.UNAUTHORIZED, "Token error"));
        }
        resolve(payload);
      });
    });
    console.log(user)
    req.user = user;
    next();
  } catch (error) {
    console.log(`lỗi authenticationMiddleware:${error}`);
    next(error);
  }
};

module.exports = authenticationMiddleware;
