/**
 * File-based database — data saves to backend/data/db/ (no MongoDB / .env required)
 * Features: Atomic writes, auto-backup, corruption protection, crash recovery
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data', 'db');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

const COLLECTIONS = {
  users: path.join(DB_DIR, 'users.json'),
  bookings: path.join(DB_DIR, 'bookings.json'),
  messages: path.join(DB_DIR, 'messages.json'),
  notifications: path.join(DB_DIR, 'notifications.json'),
  meetings: path.join(DB_DIR, 'meetings.json'),
  counters: path.join(DB_DIR, 'counters.json')
};

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

ensureDirectories();

// Create backup before write
function createBackup(name) {
  try {
    const filePath = COLLECTIONS[name];
    if (!fs.existsSync(filePath)) return;
    
    const backupPath = path.join(BACKUP_DIR, `${name}.${Date.now()}.backup.json`);
    fs.copyFileSync(filePath, backupPath);
    
    // Keep only last 10 backups per collection
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(name + '.') && f.endsWith('.backup.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: parseInt(f.split('.')[1]) || 0
      }))
      .sort((a, b) => b.time - a.time);
    
    // Remove old backups
    if (backups.length > 10) {
      backups.slice(10).forEach(b => {
        try {
          fs.unlinkSync(b.path);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    }
  } catch (error) {
    console.warn(`Backup creation failed for ${name}:`, error.message);
  }
}

// Atomic write - write to temp file first, then rename
function atomicWrite(filePath, data) {
  const tempPath = filePath + '.tmp';
  const backupPath = filePath + '.bak';
  
  try {
    // Write to temp file
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Ensure data is flushed to disk
    const fd = fs.openSync(tempPath, 'r+');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    
    // Create backup of current file if exists
    if (fs.existsSync(filePath)) {
      try {
        fs.copyFileSync(filePath, backupPath);
      } catch (e) {
        // Ignore backup errors
      }
    }
    
    // Atomic rename
    fs.renameSync(tempPath, filePath);
    
    // Remove backup after successful write
    if (fs.existsSync(backupPath)) {
      try {
        fs.unlinkSync(backupPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return true;
  } catch (error) {
    // Cleanup temp file
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }
    throw error;
  }
}

// Recover from backup if main file is corrupted
function recoverFromBackup(filePath) {
  const backupPath = filePath + '.bak';
  
  if (fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(backupPath, filePath);
      console.log(`Recovered ${path.basename(filePath)} from backup`);
      return true;
    } catch (error) {
      console.error(`Failed to recover from backup:`, error.message);
    }
  }
  return false;
}

function initCollection(name) {
  const filePath = COLLECTIONS[name];
  if (!fs.existsSync(filePath)) {
    atomicWrite(filePath, []);
  }
}

Object.keys(COLLECTIONS).forEach(initCollection);

function readCollection(name) {
  try {
    const filePath = COLLECTIONS[name];
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Handle empty file
    if (!content.trim()) return [];
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error(`Corrupted data in ${name}, attempting recovery...`);
      
      // Try to recover from backup
      if (recoverFromBackup(filePath)) {
        const backupContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(backupContent);
      }
      
      // If no backup, return empty array
      console.error(`Could not recover ${name}, returning empty array`);
      return [];
    }
  } catch (error) {
    console.error(`Error reading ${name}:`, error.message);
    return [];
  }
}

function writeCollection(name, data) {
  try {
    // Create backup before write
    createBackup(name);
    
    // Atomic write
    atomicWrite(COLLECTIONS[name], data);
    return true;
  } catch (error) {
    console.error(`Error writing ${name}:`, error.message);
    return false;
  }
}

function getNextId(collectionName) {
  const counters = readCollection('counters');
  let counter = counters.find((c) => c.collection === collectionName);
  if (!counter) {
    counter = { collection: collectionName, value: 0 };
    counters.push(counter);
  }
  counter.value += 1;
  writeCollection('counters', counters);
  return String(counter.value);
}

function matchField(item, key, value) {
  if (key === '_id') {
    return (
      item._id === value ||
      String(item._id) === String(value)
    );
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.$ne !== undefined) return item[key] !== value.$ne;
    if (value.$gt !== undefined) return item[key] > value.$gt;
    if (value.$gte !== undefined) return item[key] >= value.$gte;
    if (value.$lt !== undefined) return item[key] < value.$lt;
    if (value.$lte !== undefined) return item[key] <= value.$lte;
    if (value.$in !== undefined) return value.$in.includes(item[key]);
    if (value.$regex !== undefined) {
      const flags = value.$options?.includes('i') ? 'i' : '';
      return new RegExp(value.$regex, flags).test(String(item[key] || ''));
    }
  }

  return item[key] === value;
}

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or) {
    return filter.$or.some((clause) => matchesFilter(item, clause));
  }

  return Object.keys(filter).every((key) => {
    if (key === '$or') return true;
    return matchField(item, key, filter[key]);
  });
}

class FileCollection {
  constructor(name) {
    this.name = name;
    initCollection(name);
  }

  find(filter = {}) {
    return readCollection(this.name).filter((item) => matchesFilter(item, filter));
  }

  findOne(filter = {}) {
    return this.find(filter)[0] || null;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  insertOne(doc) {
    const data = readCollection(this.name);
    const newDoc = {
      ...doc,
      _id: doc._id ? String(doc._id) : getNextId(this.name),
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newDoc);
    writeCollection(this.name, data);
    return newDoc;
  }

  insertMany(docs) {
    return docs.map((doc) => this.insertOne(doc));
  }

  updateOne(filter, update) {
    const data = readCollection(this.name);
    const index = data.findIndex((item) => matchesFilter(item, filter));
    if (index === -1) return { modifiedCount: 0 };

    let updatedDoc = { ...data[index] };

    if (update.$set) {
      updatedDoc = { ...updatedDoc, ...update.$set };
    } else if (!update.$push && !update.$pull) {
      updatedDoc = { ...updatedDoc, ...update };
    }

    if (update.$push) {
      Object.keys(update.$push).forEach((key) => {
        if (!updatedDoc[key]) updatedDoc[key] = [];
        updatedDoc[key].push(update.$push[key]);
      });
    }

    updatedDoc.updatedAt = new Date().toISOString();
    data[index] = updatedDoc;
    writeCollection(this.name, data);
    return { modifiedCount: 1, doc: updatedDoc };
  }

  updateMany(filter, update) {
    const data = readCollection(this.name);
    let modifiedCount = 0;
    data.forEach((item, index) => {
      if (matchesFilter(item, filter)) {
        let updatedDoc = { ...item };
        if (update.$set) updatedDoc = { ...updatedDoc, ...update.$set };
        else updatedDoc = { ...updatedDoc, ...update };
        updatedDoc.updatedAt = new Date().toISOString();
        data[index] = updatedDoc;
        modifiedCount++;
      }
    });
    if (modifiedCount > 0) writeCollection(this.name, data);
    return { modifiedCount };
  }

  deleteOne(filter) {
    const data = readCollection(this.name);
    const index = data.findIndex((item) => matchesFilter(item, filter));
    if (index === -1) return { deletedCount: 0 };
    data.splice(index, 1);
    writeCollection(this.name, data);
    return { deletedCount: 1 };
  }

  deleteMany(filter) {
    const data = readCollection(this.name);
    const newData = data.filter((item) => !matchesFilter(item, filter));
    const deletedCount = data.length - newData.length;
    if (deletedCount > 0) writeCollection(this.name, newData);
    return { deletedCount };
  }

  countDocuments(filter = {}) {
    return this.find(filter).length;
  }
}

// Create collection instances
const Users = new FileCollection('users');
const Bookings = new FileCollection('bookings');
const Messages = new FileCollection('messages');
const Notifications = new FileCollection('notifications');
const Meetings = new FileCollection('meetings');

module.exports = {
  FileCollection,
  Users,
  Bookings,
  Messages,
  Notifications,
  Meetings,
  readCollection,
  writeCollection,
  getNextId,
  ensureDirectories,
  createBackup
};
