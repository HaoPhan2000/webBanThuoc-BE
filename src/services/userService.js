require("dotenv").config();
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const otpService = require("./otpService");
class CustomMessageEC {
  constructor(EC, EM) {
    this.EC = EC;
    this.EM = EM;
  }
}
class CustomMessage {
  constructor(EM) {
    this.EM = EM;
  }
}
const createCustomerService = async (customerData) => {
  try {
    const user = await User.findOne({ email: customerData.email });
    if (user) {
      throw new CustomMessage("Email đã tồn tại");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const isValid = emailRegex.test(customerData.email);
    if (!isValid) {
      throw new CustomMessage("Tài khoản phải đúng định dạng đuôi @gmail.com");
    }
    return new CustomMessage("Thành công");
  } catch (error) {
    throw error;
  }
};
const verifyOtp = async ({ otp, dataUser }) => {
  try {
    await otpService.verify({ otp, email: dataUser.email });
    const hashPassWord = await bcrypt.hash(dataUser.password, saltRounds);
    await User.create({
      name: dataUser.name,
      email: dataUser.email,
      password: hashPassWord,
    });
    await Otp.deleteMany({ email: dataUser.email });
    return new CustomMessageEC(1, "Đăng ký tài khoản thành công");
  } catch (error) {
    if (error?.EC === 102) {
      await Otp.deleteMany({ email: dataUser.email });
    }
    throw error;
  }
};
const loginCustomerService = async (customerData) => {
  try {
    const user = await User.findOne({ email: customerData.email });
    if (!user) {
      throw new CustomMessageEC(103, "Email/Password không hợp lệ");
    }
    const isMatchPassWord = await bcrypt.compare(
      customerData.password,
      user.password
    );
    if (!isMatchPassWord) {
      throw new CustomMessageEC(102, "Email/Password không hợp lệ");
    }
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };
    const access_token = jwt.sign(payload, process.env.Private_KeyAccessToken, {
      expiresIn: process.env.Time_JwtAccessToken,
    });
    const refresh_token = jwt.sign(
      payload,
      process.env.Private_KeyRefreshToken,
      {
        expiresIn: process.env.Time_JwtRefreshToken,
      }
    );

    await user.updateOne({ refreshToken: refresh_token });
    return { EC: 1, EM: "Đăng nhập thành công", access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};
const forgotPasswordService = async (customerData) => {
  try {
    const user = await User.findOne({ email: customerData.email });
    if (!user) {
      throw new CustomMessage("Không tìm thấy địa chỉ email");
    }
    const secret = process.env.Private_KeyResetPassword + user.password;
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.Time_JwtResetPassword,
    });
    const link = `${process.env.Domain}/reset-password?user_id=${user._id}&token=${token}`;
    return link;
  } catch (error) {
    throw error;
  }
};
const resetPasswordService = async (dataUser) => {
  const { user_id, token, password } = dataUser;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      throw new CustomMessage("Không tìm thấy user");
    }
    const secret = process.env.Private_KeyResetPassword + user.password;
    const payload = jwt.verify(token, secret);
    const hashPassWord = await bcrypt.hash(password, saltRounds);
    await User.findByIdAndUpdate(payload.id, { password: hashPassWord });

    return new CustomMessage("Đặt lại mật khẩu thành công");
  } catch (error) {
    throw error;
  }
};
const getRankService = async () => {
  try {
    const rank = await User.find({}).select("-password -refreshToken").sort({"score":-1});
    if (!rank) throw new CustomMessage("không tìm thấy bảng xếp hạng");
    return rank;
  } catch (error) {
    throw error;
  }
};
const refreshTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error("You are not authenticated");
    }
    const payload = jwt.verify(
      refreshToken,
      process.env.Private_KeyRefreshToken
    );
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid token");
    }

    const newAccessToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.Private_KeyAccessToken,
      { expiresIn: process.env.Time_JwtAccessToken }
    );

    const newRefreshToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.Private_KeyRefreshToken,
      {
        expiresIn: process.env.Time_JwtRefreshToken,
      }
    );
    await user.updateOne({ refreshToken: newRefreshToken });
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw error;
  }
};
const updateScoreService = async (id, score) => {
  console.log(id)
  try {
    const user = await User.findByIdAndUpdate(id, { $max: { score } });
    if (!user) {
      throw new CustomMessage("Không tìm thấy user");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  resetPasswordService,
  forgotPasswordService,
  refreshTokenService,
  createCustomerService,
  loginCustomerService,
  getRankService,
  verifyOtp,
  updateScoreService,
};
