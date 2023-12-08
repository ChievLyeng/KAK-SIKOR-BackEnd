const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// app
const app = require("./app");

require("dotenv").config();

const ReviewRoute = require("./routes/reviewRoute");
const { findOneAndUpdate } = require("./models/categoryModel");

const connectDB = require("./config/DB");
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!  ");
  console.log(err.name, err.message);
  process.exit(1);
});

// middleware
// app.use(cors());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// routes
// app.use("/reviews", ReviewRoute);
// app.use("/users", userRoute);
// app.use("/products", productRoute);
// app.use("/category", categoryRoute);
// app.use("/orders", orderRoute);

// db
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("Connected to MongoDB & Listening on port", process.env.PORT);
});

// handle unhandleRejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
