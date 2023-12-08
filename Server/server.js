const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const cors = require("cors");
const morgan = require("morgan");

// app
const app = require("./app");
require("dotenv").config();


const connectDB = require("./config/DB");
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!  ");
  console.log(err.name, err.message);
  process.exit(1);
});

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
