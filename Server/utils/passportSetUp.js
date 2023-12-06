const passport = require("passport");
require("dotenv").config();
const User = require("../models/userModel");
const SessionToken = require("../models/sessionModel");

const GoogleStrategy = require("passport-google-oauth2").Strategy;

// Function to generate a secure password
function generatePassword(length = 12) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  const passwordArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    passwordArray.push(characters.charAt(randomIndex));
  }

  return passwordArray.join("");
}

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "75543058548-pf22sek6rlu504d94iotgarhqm9vs7lb.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:8000/users/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log("Google Profile Information:", profile);
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            profilePicture:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : null,
            firstName: profile.given_name || null,
            lastName: profile.family_name || null,
            userName: profile.displayName || null,
            gender: profile.gender || "Other",
            birthDate: 0,
            password: generatePassword, // Set a unique password or handle this based on your authentication flow
            phoneNumber: 0,
            verified: profile.email_verified,
            address: {
              city: "",
              commune: "",
              district: "",
              village: "",
              homeNumber: 0,
              street: "",
            },
          });

          await user.save();
        }

        done(null, user);
      } catch (error) {
        console.error("Error during GoogleStrategy:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
module.exports = passport;
