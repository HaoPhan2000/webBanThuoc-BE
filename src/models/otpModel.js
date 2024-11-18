const { Sequelize, DataTypes, Model } = require("sequelize");
const constants =require("../utils/constants")
const sequelize=require("../config/config")
class Otp extends Model {}

Otp.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    otpCode: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + constants.timeOtp * 1000), // 60 giây kể từ thời điểm tạo
    },
  },
  {
    sequelize,
    modelName: "Otp",
    tableName: "otps",
  }
);

// Job xóa các OTP đã hết hạn
setInterval(async () => {
  await Otp.destroy({
    where: {
      expiresAt: {
        [Sequelize.Op.lt]: new Date(), // OTP đã hết hạn
      },
    },
  });
}, 30 * 1000);

module.exports = Otp;
