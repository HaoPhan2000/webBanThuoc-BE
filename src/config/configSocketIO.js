const { Server } = require("socket.io");
const env = require("../config/environment");
const constants = require("../utils/constants");
const connectEvent = require("../socket/connectEvent");
let io;
function setupSocketIO(server) {
   io = new Server(server, {
    path: `${constants.BASE_URL_API_VERSION}/socket.io`,
    cors: {
      origin: env.DomainInterface,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    connectEvent(socket);
    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
function getIO() {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
}
module.exports = {setupSocketIO,getIO};
