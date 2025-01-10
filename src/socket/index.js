const userSockets = new Map();

const indexSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Khi user join với ID
    socket.on("join-room", (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} joined room`);
    });

    // Khi client ngắt kết nối
    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      }
    });
  });
};

module.exports = { indexSocket, userSockets };
