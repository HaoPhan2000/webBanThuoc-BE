const express =require("express")
const useragent = require("express-useragent");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./src/config/cors");
const env=require("./src/config/environment")
const initRoutes=require("./src/routers/initRoutes")
const connectDB =require("./src/config/connectDB")
const app = express();
app.use(cors(corsOptions)); // Cấu hình CORS
app.use(cookieParser()); // Xử lý cookie
app.use(express.json()); // Xử lý dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu URL-encoded
app.use(useragent.express());
connectDB()
initRoutes(app)
// Chạy server
app.listen(env.PORT, () => {
  console.log(`Server đang chạy trên cổng ${env.PORT}`);
});
