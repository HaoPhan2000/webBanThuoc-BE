const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize=require("../config/config")
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    yearOfBirth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1900,
        max: new Date().getFullYear(),
      },
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Thêm ràng buộc duy nhất
      validate: {
        isEmail: true,
      },
    },
    passWord: {
      type: DataTypes.STRING(60),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    session: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    OAuth2: {
      type: Sequelize.JSON,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "user"),
      allowNull: false,
      defaultValue:"user"
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;
