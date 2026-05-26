/**
 * File-based database — data saves to backend/data/db/ (no MongoDB / .env required)
 * On Vercel, uses /tmp for temporary storage
 * Features: Atomic writes, auto-backup, corruption protection, crash recovery
 */

const fs = require('fs');
const path = require('path');
const { getDataDir } = require('../config/database');

// Get dynamic DB_DIR based on environment
const getDB_DIR = () => {
  if (process.env.VERCEL) {
    return '/tmp/data/db';
  }
  return path.join(__dirname, '..', 'data', 'db');
};

const getBACKUP_DIR = () => {
  if (process.env.VERCEL) {
    return '/tmp/data/backups';
  }
  return path.join(__dirname, '..', 'data', 'backups');
};

// Get collections with dynamic paths
const getCOLLECTIONS = () => {
  const DB_DIR = getDB_DIR();
  return {
    users: path.join(DB_DIR, 'users.json'),
    bookings: path.join(DB_DIR, 'bookings.json'),
    messages: path.join(DB_DIR, 'messages.json'),
    notifications: path.join(DB_DIR, 'notifications.json'),
    meetings: path.join(DB_DIR, 'meetings.json'),
    counters: path.join(DB_DIR, 'counters.json')
  };
};

// Ensure directories exist
function ensureDirectories() {
  const DB_DIR = getDB_DIR();
  const BACKUP_DIR = getBACKUP_DIR();
  
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
    const COLLECTIONS = getCOLLECTIONS();
    const BACKUP_DIR = getBACKUP_DIR();
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
    // Cleanup temp file on error
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

// Read collection - returns array of documents
function readCollection(name) {
  try {
    const COLLECTIONS = getCOLLECTIONS();
    const filePath = COLLECTIONS[name];
    
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Handle empty file
    if (!data.trim()) {
      return [];
    }
    
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      // Try to recover from backup
      const BACKUP_DIR = getBACKUP_DIR();
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith(name + '.') && f.endsWith('.backup.json'))
        .sort()
        .reverse();
      
      for (const backup of backups) {
        try {
          const backupData = fs.readFileSync(path.join(BACKUP_DIR, backup), 'utf8');
          const parsed = JSON.parse(backupData);
          console.log(`Recovered ${name} from backup: ${backup}`);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          continue;
        }
      }
      
      console.error(`Failed to parse ${name} and no valid backup found:`, parseError.message);
      return [];
    }
  } catch (error) {
    console.error(`Error reading ${name}:`, error.message);
    return [];
  }
}

// Write collection - atomic write with backup
function writeCollection(name, data) {
  try {
    ensureDirectories();
    const COLLECTIONS = getCOLLECTIONS();
    const filePath = COLLECTIONS[name];
    
    // Create backup before write
    createBackup(name);
    
    // Atomic write
    atomicWrite(filePath, data);
    
    return true;
  } catch (error) {
    console.error(`Error writing ${name}:`, error.message);
    throw error;
  }
}

// Query with filters and options
function query(name, filters = {}, options = {}) {
  let data = readCollection(name);
  
  // Apply filters
  if (filters && Object.keys(filters).length > 0) {
    data = data.filter(doc => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle nested fields (e.g., 'user.id')
        const keys = key.split('.');
        let field = doc;
        for (const k of keys) {
          field = field?.[k];
          if (field === undefined) return false;
        }
        
        // Handle different comparison types
        if (typeof value === 'object' && value !== null) {
          if (value.$gt !== undefined) return field > value.$gt;
          if (value.$gte !== undefined) return field >= value.$gte;
          if (value.$lt !== undefined) return field < value.$lt;
          if (value.$lte !== undefined) return field <= value.$lte;
          if (value.$ne !== undefined) return field !== value.$ne;
          if (value.$in !== undefined) return value.$in.includes(field);
          if (value.$nin !== undefined) return !value.$nin.includes(field);
          if (value.$regex !== undefined) {
            const regex = new RegExp(value.$regex, value.$options || '');
            return regex.test(field);
          }
        }
        
        return field === value;
      });
    });
  }
  
  // Apply sorting
  if (options.sort) {
    const [sortField, sortOrder] = Object.entries(options.sort)[0] || ['_id', 1];
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortOrder === -1) {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }
  
  // Apply pagination
  if (options.skip) {
    data = data.slice(options.skip);
  }
  if (options.limit) {
    data = data.slice(0, options.limit);
  }
  
  return data;
}

// Find one document
function findOne(name, filters = {}) {
  const results = query(name, filters, { limit: 1 });
  return results[0] || null;
}

// Insert document
function insert(name, doc) {
  const data = readCollection(name);
  
  // Generate ID if not provided
  if (!doc._id && !doc.id) {
    doc._id = generateId();
  }
  
  // Add timestamps
  const now = new Date().toISOString();
  doc.createdAt = doc.createdAt || now;
  doc.updatedAt = now;
  
  data.push(doc);
  writeCollection(name, data);
  
  return doc;
}

// Update documents
function update(name, filters, updateData, options = {}) {
  let data = readCollection(name);
  let modifiedCount = 0;
  
  // Find matching documents
  const matchingIndices = data.reduce((indices, doc, index) => {
    const matches = Object.entries(filters).every(([key, value]) => {
      const keys = key.split('.');
      let field = doc;
      for (const k of keys) {
        field = field?.[k];
        if (field === undefined) return false;
      }
      return field === value;
    });
    if (matches) indices.push(index);
    return indices;
  }, []);
  
  if (matchingIndices.length === 0) {
    return { modifiedCount: 0, matchedCount: 0 };
  }
  
  // Update matching documents
  matchingIndices.forEach(index => {
    const doc = data[index];
    
    if (updateData.$set) {
      Object.entries(updateData.$set).forEach(([key, value]) => {
        const keys = key.split('.');
        if (keys.length === 1) {
          doc[key] = value;
        } else {
          // Handle nested fields
          let target = doc;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
          }
          target[keys[keys.length - 1]] = value;
        }
      });
    }
    
    if (updateData.$push) {
      Object.entries(updateData.$push).forEach(([key, value]) => {
        if (!doc[key]) doc[key] = [];
        if (Array.isArray(doc[key])) {
          doc[key].push(value);
        }
      });
    }
    
    if (updateData.$pull) {
      Object.entries(updateData.$pull).forEach(([key, condition]) => {
        if (Array.isArray(doc[key])) {
          doc[key] = doc[key].filter(item => {
            if (condition._id) return item._id !== condition._id;
            return true;
          });
        }
      });
    }
    
    // Update timestamp
    doc.updatedAt = new Date().toISOString();
    modifiedCount++;
    
    if (options.upsert && modifiedCount === 1) {
      // Only update first match for upsert
      return;
    }
  });
  
  writeCollection(name, data);
  
  return {
    modifiedCount,
    matchedCount: matchingIndices.length
  };
}

// Delete documents
function remove(name, filters) {
  let data = readCollection(name);
  const initialLength = data.length;
  
  data = data.filter(doc => {
    return !Object.entries(filters).every(([key, value]) => {
      const keys = key.split('.');
      let field = doc;
      for (const k of keys) {
        field = field?.[k];
        if (field === undefined) return false;
      }
      return field === value;
    });
  });
  
  const deletedCount = initialLength - data.length;
  
  if (deletedCount > 0) {
    writeCollection(name, data);
  }
  
  return { deletedCount };
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get next sequence value (for auto-increment)
function getNextSequence(name) {
  const counters = readCollection('counters');
  const counter = counters.find(c => c._id === name);
  
  let nextValue = 1;
  if (counter) {
    nextValue = (counter.seq || 0) + 1;
    update('counters', { _id: name }, { $set: { seq: nextValue, updatedAt: new Date().toISOString() } });
  } else {
    insert('counters', { _id: name, seq: nextValue });
  }
  
  return nextValue;
}

// Export all functions
module.exports = {
  readCollection,
  writeCollection,
  query,
  findOne,
  insert,
  update,
  remove,
  generateId,
  getNextSequence,
  ensureDirectories,
  getCOLLECTIONS,
  getDB_DIR,
  getBACKUP_DIR
};
