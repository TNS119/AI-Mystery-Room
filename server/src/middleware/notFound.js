const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404));
};

module.exports = notFound;
