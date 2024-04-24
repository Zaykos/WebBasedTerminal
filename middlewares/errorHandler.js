const { OperationalError } = require('./customErrors');
const logger = require('./logger');

function errorHandler(err, req, res, next) {
  if (err instanceof OperationalError) {
    // Handle operational errors differently
    res.status(500).send({ error: err.message });
  } else {
    // Log programmer errors and don't leak details
    logger.error(err);
    res.status(500).send({ error: 'An unexpected error occurred' });
  }
}

module.exports = errorHandler;
