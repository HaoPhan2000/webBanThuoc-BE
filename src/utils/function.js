const env = require("../config/environment");
const jwt = require("jsonwebtoken");
const Function = {
  createTokens: (payload) => {
    const accessToken = jwt.sign(payload, env.Private_KeyAccessToken, {
      expiresIn: env.Time_JwtAccessToken,
    });

    const refreshToken = jwt.sign(payload, env.Private_KeyRefreshToken, {
      expiresIn: env.Time_JwtRefreshToken,
    });

    return { accessToken, refreshToken };
  },
  updateSessions: async (user, accessToken,refreshToken, uniqueId) => {
    const sessions = JSON.parse(user.session || "[]");
    if (sessions.length >= 3) {
      sessions.shift();
    }
    sessions.push({ idDevice: uniqueId, accessToken,refreshToken });
    await user.update({ session: sessions });
  },
};
module.exports = Function;
