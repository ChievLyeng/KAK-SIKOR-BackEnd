const passport = require("passport");
require("dotenv").config();
const User = require("../models/userModel");
const SessionToken = require("../models/sessionModel");
const validator = require("validator");

const GoogleStrategy = require("passport-google-oauth2").Strategy;

// Function to generate a secure password
function generatePassword(length = 12) {
  // Define character sets
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numericChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+";

  // Combine all character sets
  const allChars = lowercaseChars + uppercaseChars + numericChars + symbolChars;

  // Initialize password array
  const passwordArray = [];

  // Helper function to get a random character from a given character set
  function getRandomChar(characters) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters.charAt(randomIndex);
  }

  // Add at least one character from each character set
  passwordArray.push(getRandomChar(lowercaseChars));
  passwordArray.push(getRandomChar(uppercaseChars));
  passwordArray.push(getRandomChar(numericChars));
  passwordArray.push(getRandomChar(symbolChars));

  // Generate the rest of the password
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(getRandomChar(allChars));
  }

  // Shuffle the password array to randomize the order
  passwordArray.sort(() => Math.random() - 0.5);

  return passwordArray.join("");
}

// Function to generate a unique phone number
async function generateUniquePhoneNumber() {
  const characters = "0123456789";
  let phoneNumber;

  do {
    phoneNumber = ""; // Reset phoneNumber
    // Generate a random 10-digit phone number
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      phoneNumber += characters.charAt(randomIndex);
    }
    // Check if the generated phoneNumber is already in use
  } while (await User.findOne({ phoneNumber }));

  return phoneNumber;
}

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "75543058548-pf22sek6rlu504d94iotgarhqm9vs7lb.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:8000/api/v1/users/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log("Google Profile Information:", profile);

        // Check if a user with the Google ID and email already exists
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            {
              email:
                profile.emails && profile.emails.length > 0
                  ? profile.emails[0].value
                  : null,
            },
          ],
        });

        if (!user) {
          const firstName = profile.given_name || lastName;
          const lastName = profile.family_name || firstName; // Set to firstName if family_name is not present
          const phoneNumber = await generateUniquePhoneNumber();
          const password = await generatePassword();

          user = new User({
            authMethod: "google",
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            profilePicture:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : null,
            firstName,
            lastName,
            userName: profile.displayName || "",
            gender: profile.gender || "Other",
            birthDate: 0,
            password,
            phoneNumber,
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
        } else {
          // If the user exists, update their information (if needed)
          user.email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : user.email;
          // ... (update other fields if needed)

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
