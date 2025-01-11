const redis=require("../config/configRedisClould")
const redisFunction={
    addToBlacklist:async (token, ttl) => {
        await redis.set(`blacklist:${token}`,"1", "EX", ttl); // `EX` để đặt TTL
    },
    isBlacklisted: async (token) => {
        const result = await redis.exists(`blacklist:${token}`);
        return result
    }
}
module.exports = redisFunction;