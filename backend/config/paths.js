const fs = require('fs');
const path = require('path');

// Persistent storage root (set on Spaceship, e.g. /home/username/dr-mahar-data)
const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(__dirname, '..', 'data')
);
const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads')
);

function ensureDataDirectories() {
  for (const dir of [DATA_DIR, UPLOADS_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created data directory: ${dir}`);
    }
  }
}

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  ensureDataDirectories
};
