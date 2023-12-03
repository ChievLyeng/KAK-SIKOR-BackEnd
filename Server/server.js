const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("dotenv").config();
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!  ");
  console.log(err.name, err.message);
  process.exit(1);
});

// app
const app = require("./app");

// connect to db
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database is connected");
});

const PORT =process.env.PORT || 5000

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
