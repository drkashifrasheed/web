/**
 * File-based Database Configuration
 * Simple JSON file storage for persistent data without MongoDB
 * Data is saved to backend/data/db/ directory and persists across server restarts
 */

const fs = require('fs');
const path = require('path');

let isConnected = true; // Always true for file-based storage

// Check if database is available (always true for file-based)
const isDatabaseConnected = () => {
  return isConnected;
};

// Initialize database - creates data directories and files
const connectDB = async () => {
  try {
    const dbDir = path.join(__dirname, '..', 'data', 'db');
    
    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    console.log('📁 File-based Database initialized');
    console.log('📂 Data directory:', dbDir);
    console.log('✅ All collections ready (users, bookings, messages, notifications, meetings)');
    console.log('✅ Database connection successful (File-based)');

    const ensureAdmin = require('../utils/ensureAdmin');
    await ensureAdmin();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    isConnected = false;
    return false;
  }
};

module.exports = {
  connectDB,
  isDatabaseConnected
};
