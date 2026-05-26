const fs = require('fs');
const path = require('path');

// Persistent storage root (set on Spaceship, e.g. /home/username/dr-mahar-data)
// On Vercel, use /tmp for writable storage
const getDataDir = () => {
  if (process.env.VERCEL) {
    return '/tmp/data';
  }
  return path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
};

const getUploadsDir = () => {
  if (process.env.VERCEL) {
    return '/tmp/data/uploads';
  }
  return path.resolve(process.env.UPLOADS_DIR || path.join(getDataDir(), 'uploads'));
};

const DATA_DIR = getDataDir();
const UPLOADS_DIR = getUploadsDir();

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
  ensureDataDirectories,
  getDataDir,
  getUploadsDir
};
