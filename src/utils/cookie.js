const constants = require("../utils/constants");
const cookie = {
  setCookie: (res, cookieName, data, age) => {
    res.cookie(cookieName, data, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
  },
  clearCookie: (res, cookieName) => {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
  },
  clearAllCookiesToken: (res, req) => {
    const cookiesToClear = [
      constants.TEXT.accessTokenName,
      constants.TEXT.refreshTokenName,
    ];
    cookiesToClear.forEach((cookieName) => {
      cookie.clearCookie(res, cookieName);
    });
  },
};

module.exports = cookie;
