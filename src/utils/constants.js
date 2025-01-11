const constants = {
  TEXT: {
    refreshTokenName: "refreshToken",
    accessTokenName: "accessToken",
    mailRegisterTitle: "Đăng ký tài khoản",
    mailRegisterContent:
      "Vui lòng nhập mã xác thực để hoàn tất đăng ký tài khoản!",
    mailForgotPassword: "Vui lòng truy cập liên kết để cập nhật mật khẩu!",
  },
  BASE_URL_API_VERSION: "/v1/api",
  PUBLIC_PATH: Object.freeze([
    "/",
    "/register",
    "/confirmOtp",
    "/login",
    "/refreshToken",
    "/forgotPassword",
    "/resetPassword",
    "/account",
    "/auth/google",
    "/auth/google/callback",
    "/socket.io/"
  ]),
  timeOtp: 60,
  loginType:{
    passWord:"passWord",
    OAuth2:"OAuth2",
    both:"both"
  }
};
module.exports = constants;
