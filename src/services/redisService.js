const redis = require("../config/configRedisClould");
const redisService = {
  addToBlacklist: async (token, ttl) => {
    await redis.set(`blacklist:${token}`, "1", "EX", ttl); // `EX` để đặt TTL
  },
  isBlacklisted: async (token) => {
    return await redis.exists(`blacklist:${token}`);
  },
  addSocketId: async (userId, idSocket, ttl) => {
    await redis.sadd(`socketIoUser:${userId}`, idSocket);
    await redis.expire(`socketIoUser:${userId}`, ttl);
  },
  getAllSocketIdList: async (userId) => {
    return await redis.smembers(`socketIoUser:${userId}`);
  },
  deleteSocketId: async (userId, idSocket) => {
    await redis.srem(`socketIoUser:${userId}`, idSocket);
  },
  deleteAllSocketId: async (userId) => {
    await redis.del(`socketIoUser:${userId}`);
  },
};
module.exports = redisService;
