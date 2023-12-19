const dotenv = require("dotenv");
// app
const app = require("./app");

require("dotenv").config();

const connectDB = require("./config/DB");
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", () => {
  process.exit(1);
});

// db
connectDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB & Listening on port", process.env.PORT);
});

// handle unhandleRejection error
process.on("unhandledRejection", () => {
  server.close(() => {
    process.exit(1);
  });
});
