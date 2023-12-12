const dotenv = require("dotenv");
const express = require("express");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
//const passportConfig = require("./utils/passportSetUp");
const session = require("express-session");
// app
const app = require("./app");
require("dotenv").config();

const ReviewRoute = require("./routes/reviewRoute");

const connectDB = require("./config/DB");
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", () => {
  process.exit(1);
});

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Use express-session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
// Initialize Passport and restore authentication state if available from the session
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/reviews", ReviewRoute);
app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/category", categoryRoute);
app.use("/orders", orderRoute);

// db
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB & Listening on port", process.env.PORT);
});

// handle unhandleRejection error
process.on("unhandledRejection", () => {
  server.close(() => {
    process.exit(1);
  });
});
