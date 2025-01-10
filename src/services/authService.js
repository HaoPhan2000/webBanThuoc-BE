const User = require("../models/userModel");
const constants = require("../utils/constants");
const Otp = require("../models/otpModel");
const loginLogger = require("../loggers/loginLogger");
const customError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const otpService = require("../services/otpService");
const { v4: uuidv4 } = require("uuid");
const Function = require("../utils/function");
const env = require("../config/environment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const authService = {
  register: async ({ email }) => {
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (user) {
        throw new customError(StatusCodes.CONFLICT, "Email already exists");
      }
    } catch (error) {
      throw error;
    }
  },
  confirmOtp: async ({ otp, dataUser }) => {
    try {
      await otpService.verify({ otp, email: dataUser.email });

      const hashPassWord = await bcrypt.hash(dataUser.password, saltRounds);

      await User.create({
        email: dataUser.email,
        passWord: hashPassWord,
        loginType: constants.loginType.passWord,
      });
      await Otp.destroy({ where: { email: dataUser.email } });
    } catch (error) {
      if (error?.EC === 102) {
        await Otp.destroy({ where: { email: dataUser.email } });
      }
      throw error;
    }
  },
  login: async (req) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new customError(
          StatusCodes.BAD_REQUEST,
          "Invalid Email/Password"
        );
      }

      const isMatchPassWord = await bcrypt.compare(password, user.passWord);
      if (!isMatchPassWord) {
        throw new customError(
          StatusCodes.BAD_REQUEST,
          "Invalid Email/Password"
        );
      }

      if (user.isBanned) {
        throw new customError(StatusCodes.FORBIDDEN, "USER_BANNED");
      }

      const uniqueId = uuidv4();

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        idDevice: uniqueId,
      };

      const { accessToken, refreshToken } = Function.createTokens(payload);
      await Function.updateSessions(user, accessToken, refreshToken, uniqueId);
      const ua = req.useragent;
      loginLogger.info({
        action: "login-passWord",
        email,
        ip:
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "Unknown IP",
        platform: ua.platform,
        browser: ua.browser,
        isDesktop: ua.isDesktop,
        isTablet: ua.isTablet,
        isMobile: ua.isMobile,
        isBot: ua.isBot,
        timestamp: new Date().toISOString(),
      });

      return { user: { email: user.email }, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  },
  refreshToken: async (refreshToken) => {
    try {
      if (!refreshToken) {
        throw new customError(StatusCodes.BAD_REQUEST, "Invalid token");
      }
      const payload = jwt.verify(refreshToken, env.Private_KeyRefreshToken);
      const user = await User.findOne({
        where: { id: payload.id },
      });
      if (!user) {
        throw new customError(StatusCodes.BAD_REQUEST, "User not found");
      }
      const sessions = JSON.parse(user.session || "[]");

      const indexIdDevice = sessions.findIndex(
        (item) => item.idDevice === payload.idDevice
      );
      if (indexIdDevice === -1) {
        throw new customError(
          StatusCodes.BAD_REQUEST,
          "Device not found in sessions"
        );
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        idDevice: payload.idDevice,
      };
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        Function.createTokens(newPayload);
      sessions[indexIdDevice] = {
        idDevice: payload.idDevice,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      await user.update({ session: sessions });
      return { newAccessToken, newRefreshToken };
    } catch (error) {
      throw error;
    }
  },
  forgotPassword: async ({ email }) => {
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return false;
      }
      const secret = env.Private_KeyResetPassword + user.passWord;
      const payload = {
        id: user.id,
        email: user.email,
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: env.Time_JwtResetPassword,
      });

      return `${env.DomainInterface}/reset-password?user_id=${user.id}&token=${token}`;
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async ({ user_id, token, password }) => {
    try {
      const user = await User.findOne({
        where: { id: user_id },
      });
      if (!user) {
        throw new customError(StatusCodes.BAD_REQUEST, "User not found");
      }

      const secret = env.Private_KeyResetPassword + user.passWord;

      jwt.verify(token, secret);
      const hashPassWord = await bcrypt.hash(password, saltRounds);
      await user.update({ passWord: hashPassWord });
    } catch (error) {
      throw error;
    }
  },
  logout: async (req) => {
    const user = await User.findOne({
      where: { id: req?.user?.id },
    });
    if (!user) {
      throw new customError(StatusCodes.BAD_REQUEST, "User not found");
    }
    const sessions = JSON.parse(user.session || "[]");

    const indexIdDevice = sessions.findIndex(
      (item) => item.idDevice === req?.user?.idDevice
    );
    if (indexIdDevice === -1) {
      throw new customError(
        StatusCodes.BAD_REQUEST,
        "Device not found in sessions"
      );
    }
    sessions.splice(indexIdDevice, 1);

    await user.update({ session: sessions });
  },
  account: async (req) => {
    try {
      const token = req?.cookies?.accessToken;
      if (!token) {
        throw new customError(StatusCodes.UNAUTHORIZED, "Token is required.");
      }
      const user = jwt.verify(token, env.Private_KeyAccessToken);
      return user
    } catch (error) {
      throw error;
    }
  },
};
module.exports = authService;
