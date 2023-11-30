const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const cors = require("cors");
const morgan = require("morgan");
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
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/v1/api", ReviewRoute);
app.use("/v1/api", userRoute);
app.use("/v1/api", productRoute);
app.use("/v1/api", categoryRoute);
app.use("/v1/api", orderRoute);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
app.listen(process.env.PORT, () => {
  console.log("Connected to MongoDB & Listening on port", process.env.PORT);
});
