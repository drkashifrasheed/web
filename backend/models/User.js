const bcrypt = require('bcryptjs');
const { Users } = require('../utils/fileDatabase');
const { QueryBuilder, applyProjection } = require('../utils/queryBuilder');

// User model using file-based storage
class User {
  constructor(data) {
    this._id = data._id;
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.fullName;
    this.phoneNumber = data.phoneNumber || '';
    this.profileImage = data.profileImage || '';
    this.role = data.role || 'patient';
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailVerificationOTP = data.emailVerificationOTP || null;
    this.emailVerificationOTPExpires = data.emailVerificationOTPExpires || null;
    this.loginVerificationOTP = data.loginVerificationOTP || null;
    this.loginVerificationOTPExpires = data.loginVerificationOTPExpires || null;
    this.isLoginVerified = data.isLoginVerified || false;
    this.tempLoginToken = data.tempLoginToken || null;
    this.profileUpdateOTP = data.profileUpdateOTP || null;
    this.profileUpdateOTPExpires = data.profileUpdateOTPExpires || null;
    this.deleteAccountOTP = data.deleteAccountOTP || null;
    this.deleteAccountOTPExpires = data.deleteAccountOTPExpires || null;
    this.bookingCancelOTP = data.bookingCancelOTP || null;
    this.bookingCancelOTPExpires = data.bookingCancelOTPExpires || null;
    this.age = data.age || null;
    this.weight = data.weight || null;
    this.gender = data.gender || null;
    this.bloodGroup = data.bloodGroup || null;
    this.allergies = data.allergies || [];
    this.medicalHistory = data.medicalHistory || '';
    this.currentMedications = data.currentMedications || [];
    this.chronicConditions = data.chronicConditions || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Doctor-specific fields
    if (this.role === 'doctor') {
      this.specialization = data.specialization || '';
      this.qualifications = data.qualifications || [];
      this.experience = data.experience || 0;
      this.licenseNumber = data.licenseNumber || '';
      this.consultationFee = data.consultationFee || 0;
      this.availability = data.availability || {};
      this.rating = data.rating || 0;
      this.totalReviews = data.totalReviews || 0;
      this.about = data.about || '';
    }
  }

  // Save user to database
  async save() {
    this.updatedAt = new Date().toISOString();
    
    if (this._id) {
      // Update existing user
      const result = Users.updateOne({ _id: this._id }, { $set: this.toJSON() });
      return result.modifiedCount > 0 ? this : null;
    } else {
      // Create new user
      const newUser = Users.insertOne(this.toJSON());
      this._id = newUser._id;
      return this;
    }
  }

  // Convert to JSON
  toJSON() {
    const data = {
      _id: this._id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      profileImage: this.profileImage,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      emailVerificationOTP: this.emailVerificationOTP,
      emailVerificationOTPExpires: this.emailVerificationOTPExpires,
      loginVerificationOTP: this.loginVerificationOTP,
      loginVerificationOTPExpires: this.loginVerificationOTPExpires,
      isLoginVerified: this.isLoginVerified,
      tempLoginToken: this.tempLoginToken,
      profileUpdateOTP: this.profileUpdateOTP,
      profileUpdateOTPExpires: this.profileUpdateOTPExpires,
      bookingCancelOTP: this.bookingCancelOTP,
      bookingCancelOTPExpires: this.bookingCancelOTPExpires,
      age: this.age,
      weight: this.weight,
      gender: this.gender,
      bloodGroup: this.bloodGroup,
      allergies: this.allergies,
      medicalHistory: this.medicalHistory,
      currentMedications: this.currentMedications,
      chronicConditions: this.chronicConditions,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    // Include doctor-specific fields if role is doctor
    if (this.role === 'doctor') {
      data.specialization = this.specialization;
      data.qualifications = this.qualifications;
      data.experience = this.experience;
      data.licenseNumber = this.licenseNumber;
      data.consultationFee = this.consultationFee;
      data.availability = this.availability;
      data.rating = this.rating;
      data.totalReviews = this.totalReviews;
      data.about = this.about;
    }

    return data;
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Get public profile (no sensitive data)
  getPublicProfile() {
    return {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      profileImage: this.profileImage,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      age: this.age,
      gender: this.gender,
      isActive: this.isActive,
      createdAt: this.createdAt,
      ...(this.role === 'doctor'
        ? {
            specialization: this.specialization,
            experience: this.experience,
            consultationFee: this.consultationFee,
            rating: this.rating,
            totalReviews: this.totalReviews
          }
        : {})
    };
  }

  // Static methods
  static async findOne(filter) {
    const data = Users.findOne(filter);
    return data ? new User(data) : null;
  }

  static async findById(id) {
    const data = Users.findById(id);
    return data ? new User(data) : null;
  }

  static find(filter = {}) {
    return new QueryBuilder(Users, User, filter);
  }

  static async create(userData) {
    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const newUser = Users.insertOne(userData);
    return new User(newUser);
  }

  static async updateOne(filter, update) {
    return Users.updateOne(filter, update);
  }

  static async updateMany(filter, update) {
    return Users.updateMany(filter, update);
  }

  static async deleteOne(filter) {
    return Users.deleteOne(filter);
  }

  static async countDocuments(filter = {}) {
    return Users.countDocuments(filter);
  }

  static async exists(filter) {
    return Users.findOne(filter) !== null;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const result = Users.updateOne({ _id: id }, { $set: update });
    if (!result.modifiedCount && !options.upsert) return null;
    const data = Users.findById(id);
    return data ? new User(data) : null;
  }
}

module.exports = User;
