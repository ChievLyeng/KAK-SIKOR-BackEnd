const express = require("express");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const reviewRoute = require("./routes/reviewRoute");
const orderRoute = require("./routes/orderRoute");
const commentRoute = require("./routes/commentRoute");
const cors = require("cors");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const GlobalErrorHandler = require("./middlewares/globalErrorhandler");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// express app
const app = express();

// for sending cookie to frontend
const corsConfig = {
  origin: process.env.CLIENT_URL,
  methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
  credentials: true,
};
// middleware
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api end point
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/orders", orderRoute);

// handle wrong route request
app.all("*", (req, res, next) => {
  next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware
app.use(GlobalErrorHandler);

module.exports = app;