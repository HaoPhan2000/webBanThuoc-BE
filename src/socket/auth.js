const { userSockets } = require("./index");
const authSocket = (io) => {
  return {
    logoutSingleUser: (userId) => {
      const socketId = userSockets.get(userId);
      if (socketId) {
        io.to(socketId).emit("logout", {
          message: "You have been logged out by the server.",
        });
        console.log(`Notified user ${userId} to log out`);
      }
    },
    logoutMultiUser: (userId) => {},
  };
};
module.exports = authSocket;
