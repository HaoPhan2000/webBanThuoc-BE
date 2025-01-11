const env=require("../config/environment")
const Redis = require("ioredis");
const redis = new Redis({
  host:env.Redis_Host,
  port:env.Redis_Port,
  password:env.Redis_Password,
});
module.exports = redis;
