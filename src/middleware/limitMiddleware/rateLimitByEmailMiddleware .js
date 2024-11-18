const redis = require('redis');
const client = redis.createClient();

const rateLimitByEmailMiddleware = (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required.");

  const emailKey = `rate-limit:email:${email}`;
  const limit = 5;
  const timeWindow = 24 * 60 * 60; // 24 giờ

  client.multi()
    .incr(emailKey) // Tăng số lượng sử dụng email
    .expire(emailKey, timeWindow) // Đặt thời gian hết hạn 24 giờ
    .exec((err, replies) => {
      if (err) return res.status(500).send("Server Error");

      const emailRequestCount = replies[0]; // Số lần sử dụng email
      if (emailRequestCount > limit) {
        return res.status(429).json({
          status: 429,
          error: "This email has reached the daily limit for account creation."
        });
      }
      next();
    });
};

module.exports = rateLimitByEmailMiddleware;
