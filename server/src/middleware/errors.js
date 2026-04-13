function notFound(req, res, next) {
  res.status(404).json({ message: "Not found" });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };

