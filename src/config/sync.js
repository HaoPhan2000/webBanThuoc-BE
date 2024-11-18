const sequelize = require('./src/config/config');
const User = require('./src/models/userModel');
const Otp=require("./src/models/otpModel")
sequelize.sync({ force: true }) // force: true sẽ xóa bảng cũ và tạo lại bảng mới
  .then(() => {
    console.log('Bảng đã được tạo!');
  })
  .catch((err) => {
    console.error('Lỗi khi tạo bảng:', err);
  });