const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoute");
const ReviewRoute = require("./routes/reviewRoute");
const orderRoute = require("./routes/orderRoute");
const cors = require("cors");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const GlobalErrorHandler = require("./middlewares/globalErrorhandler");
require("dotenv").config();
dotenv.config({ path: "./config.env" });


// handle uncaugt exception error
process.on('uncaughtException',err => {
  console.log("UNCAUGHT EXCEPTION!  ")
  console.log(err.name,err.message)
  process.exit(1)
})

// express app
const app = express();

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api end point
app.use("/api/v1/reviews", ReviewRoute);
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

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database is connected");
  })
 

const server = app.listen(process.env.PORT, () => {
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
