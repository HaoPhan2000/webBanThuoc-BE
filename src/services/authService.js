const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const loginLogger = require("../loggers/loginLogger");
const customError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const otpService = require("../services/otpService");
const { v4: uuidv4 } = require("uuid");
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
        throw new customError(
          StatusCodes.CONFLICT,
          "Email already exists"
        );
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
        idDevice: uniqueId,
      };

      const accessToken = jwt.sign(payload, env.Private_KeyAccessToken, {
        expiresIn: env.Time_JwtAccessToken,
      });

      const refreshToken = jwt.sign(payload, env.Private_KeyRefreshToken, {
        expiresIn: env.Time_JwtRefreshToken,
      });

      let sessions = JSON.parse(user.session || "[]");
      if (sessions.length >= 3) {
        sessions.shift();
      }

      sessions.push({
        idDevice: uniqueId,
        refreshToken,
      });
      await user.update({ session: sessions });
      const ua = req.useragent;
      loginLogger.info({
        action: "login",
        email,
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        platform: ua.platform,
        browser: ua.browser,
        isDesktop: ua.isDesktop,
        isTablet: ua.isTablet,
        isMobile: ua.isMobile,
        isBot: ua.isBot,
        timestamp: new Date().toISOString(),
      });
      return { accessToken, refreshToken };
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
        idDevice: payload.idDevice,
      };

      const newAccessToken = jwt.sign(newPayload, env.Private_KeyAccessToken, {
        expiresIn: env.Time_JwtAccessToken,
      });

      const newRefreshToken = jwt.sign(
        newPayload,
        env.Private_KeyRefreshToken,
        {
          expiresIn: env.Time_JwtRefreshToken,
        }
      );
      sessions[indexIdDevice] = {
        idDevice: payload.idDevice,
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
        throw new customError(StatusCodes.BAD_REQUEST, "User not found");
      }
      const secret = env.Private_KeyResetPassword + user.passWord;
      const payload = {
        id: user.id,
        email: user.email,
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: env.Time_JwtResetPassword,
      });
      const link = `${env.Domain}/reset-password?user_id=${user._id}&token=${token}`;
      return link;
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async ({ user_id, token, password }) => {
    try {
      const user = await User.findById(user_id);
      if (!user) {
        throw new customError(StatusCodes.BAD_REQUEST, "User not found");
      }
      const secret = process.env.Private_KeyResetPassword + user.password;
      const payload = jwt.verify(token, secret);
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
};
module.exports = authService;
