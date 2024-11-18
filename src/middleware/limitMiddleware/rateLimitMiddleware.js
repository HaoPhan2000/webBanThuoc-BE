const redis = require('redis');
const client = redis.createClient();

const rateLimitMiddleware = (req, res, next) => {
  const userKey = `rate-limit:${req.ip}`;
  const limit = 15; 
  const timeWindow = 24 * 60 * 60; //24h

  client.multi()
    .incr(userKey) // Tăng số lượng request
    .expire(userKey, timeWindow) // Đặt thời gian hết hạn cho key
    .exec((err, replies) => {
      if (err) return res.status(500).send("Server Error");

      const requestCount = replies[0]; // Lấy số lượng request hiện tại
      if (requestCount > limit) {
        return res.status(429).json({
          status: 429,
          error: "Too many requests. Please try again later."
        });
      }
      next();
    });
};
module.exports=rateLimitMiddleware