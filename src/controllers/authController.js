const authService = require("../services/authService");
const { StatusCodes } = require("http-status-codes");
const otpService = require("../services/otpService");
const sendEmailService = require("../services/EmailService");
const constants = require("../utils/constants");
const cookie = require("../utils/cookie");
const customError = require("../utils/customError");
const fs = require("fs");
const authController = {
  register: async (req, res, next) => {
    try {
      const { email } = req.body;
      await authService.register({
        email: email,
      });
      const otp = await otpService.get(email);
      if (otp.code === 0) {
        throw new customError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "OTP creation failed"
        );
      }
      const template = fs.readFileSync("src/views/emaiOTP.ejs", "utf-8");
      await sendEmailService(
        email,
        {
          title: constants.TEXT.mailRegisterTitle,
          content: constants.TEXT.mailRegisterContent,
          OTP: otp.otp,
        },
        template
      );

      res.status(StatusCodes.OK).json({
        message: " Verification code has been sent",
        timeOtp: constants.timeOtp,
      });
    } catch (error) {
      next(error);
    }
  },
  confirmOtp: async (req, res, next) => {
    try {
      const { otp, dataUser } = req.body;
      await authService.confirmOtp({ otp, dataUser });
      res
        .status(StatusCodes.OK)
        .json({ message: "Account registration successful" });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const service = await authService.login(req);
      cookie.setCookie(
        res,
        constants.TEXT.accessTokenName,
        service.accessToken,
        30 * 60 * 1000
      );
      cookie.setCookie(
        res,
        constants.TEXT.refreshTokenName,
        service.refreshToken,
        90 * 24 * 60 * 60 * 1000
      );
      return res.status(StatusCodes.OK).json({ EC: 1, EM: "Login successful" });
    } catch (error) {
      next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const service = await refreshTokenService(refreshToken);
      cookie.setCookie(
        res,
        constants.TEXT.accessTokenName,
        service.newAccessToken,
        30 * 60 * 1000
      );
      cookie.setCookie(
        res,
        constants.TEXT.refreshTokenName,
        service.newRefreshToken,
        90 * 24 * 60 * 60 * 1000
      );
      return res
        .status(StatusCodes.OK)
        .json({ message: "Token refresh successful" });
    } catch (error) {
      console.log(error);
      cookie.clearCookie(res, constants.TEXT.accessTokenName);
      cookie.clearCookie(res, constants.TEXT.refreshTokenName);
      next(error);
    }
  },
  // forgotPassword: async (req, res) => {
  //   try {
  //     const { email } = req.body;
  //     const link = await forgotPasswordService({
  //       email: email,
  //     });
  //     const template = fs.readFileSync("views/forgetPassword.ejs", "utf-8");
  //     await sendEmailService(
  //       email,
  //       {
  //         title: "Khôi phục mật khẩu",
  //         content: text.mailForgotPassword,
  //         link,
  //       },
  //       template
  //     );
  //     res.status(200).json({
  //       EM: "Vui lòng truy cập địa chỉ gmail hoàn tất cập nhật mật khẩu",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(400).json(error);
  //   }
  // },
  // resetPassword: async (req, res) => {
  //   const { user_id, token, password } = req.body;
  //   try {
  //     const reset = await resetPasswordService({
  //       user_id,
  //       token,
  //       password,
  //     });

  //     res.status(200).json(reset);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(400).json(error);
  //   }
  // },
  logout: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req?.user?.id, { refreshToken: null });





      cookie.clearCookie(res, constants.TEXT.accessTokenName);
      cookie.clearCookie(res, constants.TEXT.refreshTokenName);
      res.status(StatusCodes.OK).json("Logout successful");
    } catch (error) {
      res.status(400).json(error);
    }
  },
  // account: async (req, res) => {
  //   try {
  //     res.status(200).json(req.user);
  //   } catch (error) {
  //     res.status(401).json(error);
  //   }
  // },
};
module.exports = authController;
