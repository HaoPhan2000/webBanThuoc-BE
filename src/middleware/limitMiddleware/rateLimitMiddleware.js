// const redis = require("redis");

// // Khởi tạo client Redis
// const client = redis.createClient({
//   socket: {
//     host: "127.0.0.1", // Địa chỉ Redis server (localhost)
//     port: 6379,        // Cổng Redis server
//   },
// });

// // Kết nối tới Redis server
// (async () => {
//   try {
//     await client.connect(); // Kết nối Redis
//     console.log("Connected to Redis");
//   } catch (err) {
//     console.error("Redis connection error:", err);
//   }
// })();



// const { StatusCodes } = require("http-status-codes");

// const rateLimit = (req, res, next) => {
//   const userKey = `rate-limit:${req.ip}`;
//   const limit = 10;
//   const timeWindow = 1;

//   client
//     .multi()
//     .incr(userKey) // Tăng số lượng request
//     .expire(userKey, timeWindow) // Đặt thời gian hết hạn cho key
//     .exec((err, replies) => {
//       if (err)
//         return res
//           .status(StatusCodes.INTERNAL_SERVER_ERROR)
//           .json({ message: "Redis server Error" });

//       const requestCount = replies[0]; // Lấy số lượng request hiện tại
//       if (requestCount > limit) {
//         return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
//           message: "Too many requests. Please try again later",
//         });
//       }
//       next();
//     });
// };
// module.exports = rateLimit;
