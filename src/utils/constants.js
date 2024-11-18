const constants = {
  TEXT: {
    refreshTokenName: "refreshToken",
    accessTokenName:"accessToken",
    mailRegisterTitle: "Đăng ký tài khoản",
    mailRegisterContent:
      "Vui lòng nhập mã xác thực để hoàn tất đăng ký tài khoản!",
    mailForgotPassword: "Vui lòng truy cập liên kết để cập nhật mật khẩu!",
  },
  BASE_URL_API_VERSION: "/v1/api/",
  PUBLIC_PATH: Object.freeze([
    "/",
    "register",
    "confirmOtp",
    "login",
    "refresh",
    "forgotPassword",
    "resetPassword",
    "rank",
    "auth/google-redirect",
    "auth/google",
    "auth/google/callback",
  ]),
  timeOtp: 60,
};
module.exports = constants;
