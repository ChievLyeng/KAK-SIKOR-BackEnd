const AppError = require("../utils/AppError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// const sendErrorProd = (err, res) => {
//   if (err.isOperatiional) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message
//     });
//   } else {
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!'
//     });
//   }
// }

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}.`;

  return new AppError(message,400)
}

const handleDublicatFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
}


const GlobalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  }

  if (err.code === 11000) {
    err = handleDublicatFieldsDB(err);
  }

  if (err.name === 'ValidationError') {
    handleValidationErrorDB(err);
  }
  sendErrorDev(err, res);
};




module.exports = {
  GlobalErrorHandler
}