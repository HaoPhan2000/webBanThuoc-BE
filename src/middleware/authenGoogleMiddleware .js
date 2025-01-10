const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const Function = require("../utils/function");
const constants = require("../utils/constants");
const customError = require("../utils/customError");
const env = require("../config/environment");
const saltRounds = 10;

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.Domain}${constants.BASE_URL_API_VERSION}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const dataUser = profile._json;
        if (!dataUser.email_verified) {
          throw new customError(StatusCodes.BAD_REQUEST, "Email not verified");
        }
        let user = await User.findOne({
          where: { email: dataUser.email },
        });
        const hashIdUser = await bcrypt.hash(dataUser.sub, saltRounds);
        if (!user) {
          user = await User.create({
            fullName: dataUser.name,
            email: dataUser.email,
            avatar: dataUser.picture || null,
            OAuth2: { provider: "google", id: hashIdUser },
            loginType: constants.loginType.OAuth2,
          });
        } else {
          if (user.loginType === constants.loginType.passWord) {
            await user.update({
              fullName: dataUser.name,
              avatar: dataUser.picturey || null,
              OAuth2: { provider: "google", id: hashIdUser },
              loginType: constants.loginType.both,
            });
            user = await User.findOne({
              where: { email: dataUser.email },
            });
          }

          const isGoogleIdValid = await bcrypt.compare(
            dataUser.sub,
            JSON.parse(user.OAuth2).id
          );

          if (!isGoogleIdValid) {
            throw new customError(StatusCodes.BAD_REQUEST, "Id does not match");
          }
        }

        if (user.isBanned) {
          throw new customError(StatusCodes.FORBIDDEN, "USER_BANNED");
        }
        const uniqueId = uuidv4();
        const payload = {
          id: user.id,
          email: user.email,
          role: user.role,
          idDevice: uniqueId,
        };

        const { accessToken, refreshToken } = Function.createTokens(payload);
        await Function.updateSessions(user,accessToken,refreshToken, uniqueId);
        done(null, { accessToken, refreshToken, email: dataUser.email });
      } catch (error) {
        done(error);
      }
    }
  )
);
