const rateLimitByUserAgentMiddleware = (req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (!userAgent) return res.status(400).send("User-Agent is required.");
  
    const userAgentKey = `rate-limit:user-agent:${userAgent}`;
    const limit = 5; // Giới hạn tối đa
    const timeWindow = 24 * 60 * 60; // 24 giờ
  
    client.multi()
      .incr(userAgentKey) // Tăng số lượng request từ User-Agent
      .expire(userAgentKey, timeWindow) // Đặt thời gian hết hạn 24 giờ
      .exec((err, replies) => {
        if (err) return res.status(500).send("Server Error");
  
        const requestCount = replies[0];
        if (requestCount > limit) {
          return res.status(429).json({
            status: 429,
            error: "Too many requests from this device. Please try again later."
          });
        }
        next();
      });
  };
  
  module.exports = rateLimitByUserAgentMiddleware;
  