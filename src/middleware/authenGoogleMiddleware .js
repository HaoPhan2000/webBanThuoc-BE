require("dotenv").config();
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
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile?.email_verified) {
          throw new Error("Email chưa được xác thực");
        }

        let user = await User.findOne({ email: profile.email });

        if (user) {
          // Check password match
          const isPasswordMatch = await bcrypt.compare(profile.id, user.password);
          if (!isPasswordMatch) {
            throw new Error("User không hợp lệ");
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
        const access_token = jwt.sign(payload, process.env.Private_KeyAccessToken, {
          expiresIn: process.env.Time_JwtAccessToken,
        });
        const refresh_token = jwt.sign(payload, process.env.Private_KeyRefreshToken, {
          expiresIn: process.env.Time_JwtRefreshToken,
        });

        await user.updateOne({ refreshToken: refresh_token });
        request.res.cookie(text.refreshTokenName,refresh_token, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return done(null, { access_token});
      } catch (error) {
        return done(error);
      }
    }
  )
);
