const redisService = require("../services/redisService");
module.exports = (socket) => {
  socket.on("loginUserId", async (userId) => {
    await redisService.addSocketId(userId, socket.id, 600);
    console.log(await redisService.getAllSocketIdList(userId));
  });
  socket.on("logoutUserId", async (userId) => {
    await redisService.deleteSocketId(userId, socket.id);
    console.log(await redisService.getAllSocketIdList(userId));
  });
};
