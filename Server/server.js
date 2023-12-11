const dotenv = require("dotenv");

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
