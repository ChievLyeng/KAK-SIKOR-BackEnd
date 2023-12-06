const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const connectDB = () => {

  // check and define mongo uri 
  const isProduction = process.env.NODE_ENV === "production";
  const MONGO_URI = isProduction
    ? process.env.PROD_MONGO_URI
    : process.env.DEV_MONGO_URI;

  // connect to db
  mongoose.connect(MONGO_URI).then(() => {
    console.log("Database is connected");
  });

};

module.exports = connectDB;
