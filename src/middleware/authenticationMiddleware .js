const { StatusCodes } = require("http-status-codes");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const constants = require("../utils/constants");
const authenticationMiddleware = (req, res, next) => {
  try {
    console.log("vào authenticationMiddleware");
    if (
      constants.PUBLIC_PATH.some((item) => `${constants.BASE_URL_API_VERSION}${item}` === req.originalUrl)
    ) {
      return next();
    }
    const token = req?.cookies?.refreshToken?.split(" ")[1];
    if (!token) {
      throw new customError(StatusCodes.UNAUTHORIZED, "Token is required.");
    }

    const user = jwt.verify(token, process.env.Private_KeyAccessToken);
    req.user = user;
    next();
  } catch (error) {
    console.log(`lỗi:${error}`);
    next(error);
  }
};

module.exports = authenticationMiddleware;
