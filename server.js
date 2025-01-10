const express =require("express")
const useragent = require("express-useragent");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const corsOptions = require("./src/config/cors");
const env=require("./src/config/environment")
const initRoutes=require("./src/routers/initRoutes")
const connectDB =require("./src/config/connectDB")
require("./src/middleware/authenGoogleMiddleware ");
const Redis = require("ioredis");
const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   path: "/v1/api/socket.io",
//   cors: {
//     origin: "http://localhost:5173", // Cho phép kết nối từ React App
//     methods: ["GET", "POST"],
//   },
// });
// io.on("connection", (socket) => {
//   console.log("socket nè")
//   console.log(`Client connected: ${socket.id}`);

//   // Lắng nghe và phản hồi tin nhắn từ client
//   socket.on("message", (data) => {
//     console.log(`Received message: ${data}`);
//     socket.emit("response", `Server received: ${data}`); // Gửi phản hồi về client
//   });

//   // Xử lý ngắt kết nối
//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });
app.use(cors(corsOptions)); // Cấu hình CORS
app.use(cookieParser()); // Xử lý cookie
app.use(express.json()); // Xử lý dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu URL-encoded
app.use(useragent.express());
connectDB()
initRoutes(app)
const redis = new Redis({
  host: 'redis-19953.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
  port: 19953,
  password: "xHkApR948G6fTR6mifER6rlBi4feCnGR",
});

// Kiểm tra kết nối
redis.on("connect", () => {
  console.log("Connected to Redis Cloud!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
// Chạy server
app.listen(env.PORT, () => {
  console.log(`Server đang chạy trên cổng ${env.PORT}`);
});

