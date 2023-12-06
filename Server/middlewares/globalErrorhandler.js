const AppError = require("../utils/appError");

// send error for development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//send error for prouduction
const sendErrorProd = (err, res) => {
  if (err.isOperatiional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// mongo erro
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;

  return new AppError(message, 400);
};

const handleDublicatFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];// simplet string to get the array of key

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const GlobalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") {
      err = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      err = handleDublicatFieldsDB(err);
    }

    if (err.name === "ValidationError") {
      handleValidationErrorDB(err);
    }
    sendErrorProd(err, res);
  }
};

module.exports = GlobalErrorHandler;