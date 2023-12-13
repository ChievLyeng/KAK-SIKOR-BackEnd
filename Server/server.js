const dotenv = require("dotenv");
<<<<<<< HEAD
// app
const app = require("./app");

require("dotenv").config();

=======
>>>>>>> feature/paymentBackend
const connectDB = require("./config/DB");
dotenv.config({ path: "./config.env" });

// handle uncaugt exception error
process.on("uncaughtException", () => {
  process.exit(1);
});

// db
connectDB();

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;
=======
const PORT = process.env.PORT || 3001;
>>>>>>> feature/paymentBackend
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
