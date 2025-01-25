const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./src/config/cors");
const env = require("./src/config/environment");
const initRoutes = require("./src/routers/initRoutes");
const connectDB = require("./src/config/connectDB");
const connectRedisClould = require("./src/config/connectRedisClould");
require("./src/middleware/authenGoogleMiddleware ");
const {setupSocketIO} = require("./src/config/configSocketIO");
const app = express();
const server = require("http").createServer(app);
app.use(cors(corsOptions)); // Cấu hình CORS
app.use(cookieParser()); // Xử lý cookie
app.use(express.json()); // Xử lý dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu URL-encoded
app.use(useragent.express());
connectDB();
connectRedisClould();
initRoutes(app);
setupSocketIO(server);
// Chạy server
server.listen(env.PORT, () => {
  console.log(`Server đang chạy trên cổng ${env.PORT}`);
});
