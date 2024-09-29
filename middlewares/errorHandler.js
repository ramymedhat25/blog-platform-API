const errorHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err.stack);

  // Set the status code based on the error type or provide a default
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send a JSON response with the error message
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Only include stack trace in development
  });
};

module.exports = {
  errorHandler,
};
