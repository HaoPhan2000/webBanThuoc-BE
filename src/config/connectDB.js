const sequelize = require("./config");

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connect successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
