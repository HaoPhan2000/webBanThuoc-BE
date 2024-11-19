const env = require("../config/environment");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const saltRounds = 10;
const text = require("../constants/text");
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.Domain}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile?.email_verified) {
          throw new customError(StatusCodes.BAD_REQUEST, "Email not verified");
        }

        let user = await User.findOne({ email: profile.email });

        if (user) {
          // Check password match
          const isMatchingId = await bcrypt.compare(profile.id, user.password);
          if (!isMatchingId) {
            throw new customError(StatusCodes.BAD_REQUEST, "Id does not match");
          }
        } else {
          // Create a new user
          const hashedId = await bcrypt.hash(profile.id, saltRounds);
          user = await User.create({
            name: profile.displayName,
            email: profile.email,
            password: hashedId,
          });
        }

        // Generate tokens
        const payload = { id: user._id, email: user.email, name: user.name };
        const accessToken = jwt.sign(payload, env.Private_KeyAccessToken, {
          expiresIn: env.Time_JwtAccessToken,
        });
        const refreshToken = jwt.sign(payload, env.Private_KeyRefreshToken, {
          expiresIn: env.Time_JwtRefreshToken,
        });

        await user.updateOne({ refreshToken: refresh_token });
        request.res.cookie(text.refreshTokenName, refresh_token, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return done(null, { accessToken, refreshToken });
      } catch (error) {
        return done(error);
      }
    }
  )
);
