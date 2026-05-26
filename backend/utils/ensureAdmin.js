const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Ensures default admin account exists (from ADMIN_EMAIL / ADMIN_PASSWORD in .env)
 */
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set — skip admin seed');
    return;
  }

  try {
    let user = await User.findOne({ email });

    if (user && user.role !== 'admin') {
      user.role = 'admin';
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
      console.log('✅ Existing user promoted to admin:', email);
      return;
    }

    if (user && user.role === 'admin') {
      return;
    }

    await User.create({
      fullName: 'Administrator',
      email,
      password,
      phoneNumber: '',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    console.log('✅ Admin account ready:', email);
  } catch (err) {
    console.error('❌ ensureAdmin failed:', err.message);
  }
}

module.exports = ensureAdmin;
