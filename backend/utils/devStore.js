/**
 * In-memory user store when MongoDB is unavailable (development only).
 * Data is lost when the server restarts — use MongoDB Atlas for permanent storage.
 */
const bcrypt = require('bcryptjs');

if (!global.devUsersById) global.devUsersById = new Map();
if (!global.devUsersByEmail) global.devUsersByEmail = new Map();

function saveDevUser(user) {
  const record = {
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    role: user.role || 'patient',
    isEmailVerified: user.isEmailVerified !== false,
    isActive: user.isActive !== false,
    password: user.password
  };
  global.devUsersById.set(record._id, record);
  global.devUsersByEmail.set(record.email.toLowerCase(), record);
  return record;
}

async function createDevUser({ fullName, email, password, phoneNumber }) {
  const id = `dev_${Date.now()}`;
  const hashed = await bcrypt.hash(password, 10);
  return saveDevUser({
    _id: id,
    fullName,
    email: email.toLowerCase(),
    password: hashed,
    phoneNumber: phoneNumber || '',
    role: 'patient',
    isEmailVerified: true,
    isActive: true
  });
}

function getDevUserByEmail(email) {
  return global.devUsersByEmail.get(email.toLowerCase()) || null;
}

function getDevUserById(id) {
  return global.devUsersById.get(String(id)) || null;
}

async function compareDevPassword(devUser, plainPassword) {
  return bcrypt.compare(plainPassword, devUser.password);
}

function toPublicUser(devUser) {
  if (!devUser) return null;
  const { password, ...rest } = devUser;
  return rest;
}

module.exports = {
  saveDevUser,
  createDevUser,
  getDevUserByEmail,
  getDevUserById,
  compareDevPassword,
  toPublicUser
};
