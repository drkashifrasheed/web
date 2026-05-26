const { Bookings } = require('../utils/fileDatabase');
const { QueryBuilder } = require('../utils/queryBuilder');
const User = require('./User');

// Booking model using file-based storage
class Booking {
  constructor(data) {
    this._id = data._id;
    this.patient = data.patient;
    this.doctor = data.doctor || null;
    this.patientInfo = data.patientInfo || {};
    this.medicalProblem = data.medicalProblem || '';
    this.symptoms = data.symptoms || [];
    this.appointmentType = data.appointmentType || 'in-person';
    this.preferredTime = data.preferredTime || '';
    this.additionalNotes = data.additionalNotes || '';
    this.assignedDate = data.assignedDate || null;
    this.assignedTime = data.assignedTime || null;
    this.meetingLink = data.meetingLink || '';
    this.meetingId = data.meetingId || '';
    this.status = data.status || 'pending';
    this.adminNotes = data.adminNotes || '';
    this.rejectionReason = data.rejectionReason || '';
    this.requestedAt = data.requestedAt || new Date().toISOString();
    this.respondedAt = data.respondedAt || null;
    this.completedAt = data.completedAt || null;
    this.paymentStatus = data.paymentStatus || 'awaiting_payment';
    this.paymentProofUrl = data.paymentProofUrl || '';
    this.paymentProofUploadedAt = data.paymentProofUploadedAt || null;
    this.amount = data.amount || 0;
    this.scheduledAt = data.scheduledAt || null;
    this.timeReminderSent = data.timeReminderSent || false;
    this.videoCallStatus = data.videoCallStatus || 'none';
    this.videoCallRequestedAt = data.videoCallRequestedAt || null;
    this.videoCallAcceptedAt = data.videoCallAcceptedAt || null;
    this.prescription = data.prescription || null;
    this.rating = data.rating || null;
    this.review = data.review || '';
    this.reviewedAt = data.reviewedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save booking to database
  async save() {
    this.updatedAt = new Date().toISOString();
    
    if (this._id) {
      // Update existing booking
      const result = Bookings.updateOne({ _id: this._id }, { $set: this.toJSON() });
      return result.modifiedCount > 0 ? this : null;
    } else {
      // Create new booking
      const newBooking = Bookings.insertOne(this.toJSON());
      this._id = newBooking._id;
      return this;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      _id: this._id,
      patient: this.patient,
      doctor: this.doctor,
      patientInfo: this.patientInfo,
      medicalProblem: this.medicalProblem,
      symptoms: this.symptoms,
      appointmentType: this.appointmentType,
      preferredTime: this.preferredTime,
      additionalNotes: this.additionalNotes,
      assignedDate: this.assignedDate,
      assignedTime: this.assignedTime,
      meetingLink: this.meetingLink,
      meetingId: this.meetingId,
      status: this.status,
      adminNotes: this.adminNotes,
      rejectionReason: this.rejectionReason,
      requestedAt: this.requestedAt,
      respondedAt: this.respondedAt,
      completedAt: this.completedAt,
      paymentStatus: this.paymentStatus,
      paymentProofUrl: this.paymentProofUrl,
      paymentProofUploadedAt: this.paymentProofUploadedAt,
      amount: this.amount,
      scheduledAt: this.scheduledAt,
      timeReminderSent: this.timeReminderSent,
      videoCallStatus: this.videoCallStatus,
      videoCallRequestedAt: this.videoCallRequestedAt,
      videoCallAcceptedAt: this.videoCallAcceptedAt,
      prescription: this.prescription,
      rating: this.rating,
      review: this.review,
      reviewedAt: this.reviewedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Static methods
  static async findOne(filter) {
    const data = Bookings.findOne(filter);
    return data ? new Booking(data) : null;
  }

  static async findById(id) {
    const data = Bookings.findById(id);
    return data ? new Booking(data) : null;
  }

  static find(filter = {}) {
    return new QueryBuilder(Bookings, Booking, filter);
  }

  static async findWithDoctor(filter = {}, limit = 5) {
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
    const out = [];
    for (const b of bookings) {
      const json = b.toJSON();
      if (json.doctor) {
        const doc = await User.findById(json.doctor);
        json.doctor = doc
          ? {
              _id: doc._id,
              fullName: doc.fullName,
              specialization: doc.specialization,
              profileImage: doc.profileImage
            }
          : null;
      }
      out.push(json);
    }
    return out;
  }

  static async aggregateStats(patientId) {
    const rows = Bookings.find({ patient: patientId });
    const stats = {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      rejected: 0
    };
    rows.forEach((row) => {
      if (stats[row.status] !== undefined) stats[row.status]++;
      stats.total++;
    });
    return [{ _id: 'stats', ...stats }];
  }

  static async create(bookingData) {
    const newBooking = Bookings.insertOne(bookingData);
    return new Booking(newBooking);
  }

  static async updateOne(filter, update) {
    return Bookings.updateOne(filter, update);
  }

  static async updateMany(filter, update) {
    return Bookings.updateMany(filter, update);
  }

  static async deleteOne(filter) {
    return Bookings.deleteOne(filter);
  }

  static async countDocuments(filter = {}) {
    return Bookings.countDocuments(filter);
  }

  static async exists(filter) {
    return Bookings.findOne(filter) !== null;
  }
}

module.exports = Booking;
