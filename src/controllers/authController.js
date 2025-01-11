const authService = require("../services/authService");
const { StatusCodes } = require("http-status-codes");
const otpService = require("../services/otpService");
const sendEmailService = require("../services/EmailService");
const constants = require("../utils/constants");
const cookie = require("../utils/cookie");
const customError = require("../utils/customError");
const loginLogger = require("../loggers/loginLogger");
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

      return res
        .status(StatusCodes.OK)
        .json({ EM: "Login successful", user: service.user });
    } catch (error) {
      next(error);
    }
  },
  loginGoogle: async (req, res, next) => {
    try {
      const ua = req.useragent;
      loginLogger.info({
        action: "login-google",
        email: req.user.email,
        ip:
          req.headers?.["x-forwarded-for"] ||
          req.socket?.remoteAddress ||
          "Unknown IP",
        platform: ua.platform,
        browser: ua.browser,
        isDesktop: ua.isDesktop,
        isTablet: ua.isTablet,
        isMobile: ua.isMobile,
        isBot: ua.isBot,
        timestamp: new Date().toISOString(),
      });
      cookie.setCookie(
        res,
        constants.TEXT.accessTokenName,
        req.user.accessToken,
        30 * 60 * 1000
      );

      cookie.setCookie(
        res,
        constants.TEXT.refreshTokenName,
        req.user.refreshToken,
        90 * 24 * 60 * 60 * 1000
      );
      return res.redirect(
        `http://localhost:5173/login?success=true&user=${req.user.email}`
      );
    } catch (error) {
      res.redirect(`http://localhost:5173/login?success=false`);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req?.cookies?.refreshToken;
      const service = await authService.refreshToken(refreshToken);
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
      cookie.clearAllCookiesToken(res, req);
      next(error);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const link = await authService.forgotPassword({
        email,
      });
      if (!link) {
        return res.status(StatusCodes.OK).json({
          message: "Email sent successfully",
        });
      }
      const template = fs.readFileSync("src/views/forgetPassword.ejs", "utf-8");
      await sendEmailService(
        email,
        {
          title: "Khôi phục mật khẩu",
          content: constants.TEXT.mailForgotPassword,
          link,
        },
        template
      );
      res.status(StatusCodes.OK).json({
        message: "Email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    const { user_id, token, password,logoutAllDevice} = req.body;
    console.log(logoutAllDevice)
    try {
      await authService.resetPassword({
        user_id,
        token,
        password,
        logoutAllDevice
      });
      res.status(StatusCodes.OK).json({
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      await authService.logout(req);
      cookie.clearAllCookiesToken(res, req);
      res.status(StatusCodes.OK).json("Logout successful");
    } catch (error) {
      cookie.clearAllCookiesToken(res, req);
      next(error);
    }
  },
  account: async (req, res,next) => {
    try {
      const user=await authService.account(req);
      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  },
};
module.exports = authController;
