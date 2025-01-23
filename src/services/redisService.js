const redis = require("../config/configRedisClould");
const redisService = {
  addToBlacklist: async (token, ttl) => {
    await redis.set(`blacklist:${token}`, "1", "EX", ttl); // `EX` để đặt TTL
  },
  isBlacklisted: async (token) => {
    const result = await redis.exists(`blacklist:${token}`);
    return result;
  },
  addSocketId: async (userId, idSocket) => {
    await redis.rpush(`socketIoUser:${userId}`, idSocket, (err, res) => {
      if (err) throw err;
    });
    await redis.expire(`socketIoUser:${userId}`, 259200, (err, result) => {
      if (err) throw err;
      console.log("Thiết lập TTL thành công:", result); // 1 nếu thành công
    });
  },
  getAllSocketIdList: async (userId) => {
    await redis.lrange(`socketIoUser:${userId}`, 0, -1, (err, list) => {
      if (err) throw err;
      return list;
    });
  },
  deleteSocketId: async (userId, idSocket) => {
    await redis.lrem(`socketIoUser:${userId}`, 0, idSocket, (err, res) => {
      if (err) throw err;
    });
  },
  deleteAllSocketId: async (userId) => {
    await redis.del(`socketIoUser:${userId}`, (err, result) => {
      if (err) throw err;
    });
  },
  updateSocketId: async (userId, idSocket) => {
    await redisFunction.deleteSocketId(userId, idSocket);
    await redisFunction.addSocketId(userId, idSocket);
  },
};
module.exports = redisService;
