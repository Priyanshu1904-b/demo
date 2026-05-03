function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const response = {
    message: error.message || "Server error"
  };

  if (error.details) response.details = error.details;
  if (process.env.NODE_ENV !== "production") response.stack = error.stack;

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };
