const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const cartRoutes = require("./routes/cartRoute.js");
const orderRoute = require("./routes/orderRoute");
const orderHistoryRoute = require("./routes/orderHistoryRoute");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const passportConfig = require("./utils/passportSetUp");

require("dotenv").config();

const ReviewRoute = require("./routes/reviewRoute");
const { findOneAndUpdate } = require("./models/categoryModel");

dotenv.config({ path: "./config.env" });

// express app
const app = express();

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passportConfig.initialize());

// routes
app.use("/reviews", ReviewRoute);
app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/category", categoryRoute);
app.use("/api", cartRoutes);
app.use("/orders", orderRoute);
app.use("/orderHistories", orderHistoryRoute);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("Connected to MongoDB & Listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
