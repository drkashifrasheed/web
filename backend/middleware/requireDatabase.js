const { isDatabaseConnected } = require('../config/database');

/**
 * Blocks API requests when MongoDB is not connected (production only).
 */
function requireDatabase(req, res, next) {
  if (isDatabaseConnected() || process.env.NODE_ENV !== 'production') {
    return next();
  }

  return res.status(503).json({
    success: false,
    message:
      'Database is temporarily unavailable. Your data is safe — please try again in a moment.'
  });
}

module.exports = requireDatabase;
