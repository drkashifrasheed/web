const { isDatabaseConnected } = require('../config/database');

/** Use in-memory auth when MongoDB is not connected (development only). */
function useMemoryFallback() {
  return process.env.NODE_ENV !== 'production' && !isDatabaseConnected();
}

module.exports = { useMemoryFallback };
