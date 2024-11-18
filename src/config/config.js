const Sequelize = require("sequelize");
const env = require("./environment");

const sequelize = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
  host: env.APP_HOST,
  dialect: env.DB_DIALECT,
  logging: false,
});
module.exports = sequelize;
