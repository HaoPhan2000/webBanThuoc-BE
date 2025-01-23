const { Server } = require("socket.io");
const env = require("../config/environment");
const constants = require("../utils/constants");
function setupSocketIO(server) {
  const io = new Server(server, {
    path: `${constants.BASE_URL_API_VERSION}/socket.io`,
    cors: {
      origin: env.DomainInterface,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.emit("isLogout", true);
    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketIO;
