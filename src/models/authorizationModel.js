function deepFreeze(obj) {
  // Đóng băng đối tượng ở cấp đầu tiên
  Object.freeze(obj);
  // Đóng băng sâu các thuộc tính là đối tượng con
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });
}

const userRoutes = [
  "/register",
  "/confirmOtp",
  "/login",
  "/account",
  "/refreshToken",
  "/forgotPassword",
  "/resetPassword",
  "/logout",
];

const manageRoutes = [...userRoutes, "/leaveRoleAdmin"];
const adminRoutes = [...manageRoutes, "/updateRole"];

const authorization = {
  user: userRoutes,
  manage: manageRoutes,
  admin: adminRoutes,
};

deepFreeze(authorization);

module.exports = authorization;
