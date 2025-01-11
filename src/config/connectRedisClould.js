const redis = require("./configRedisClould");
const connectRedisClould = async () => {
  redis.on("connect", () => {
    console.log("Connected to Redis Cloud!");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });
};
module.exports = connectRedisClould;
