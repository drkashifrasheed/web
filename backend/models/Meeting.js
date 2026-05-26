const { Meetings } = require('../utils/fileDatabase');

// Meeting model using file-based storage
class Meeting {
  constructor(data) {
    this._id = data._id;
    this.meetingId = data.meetingId;
    this.booking = data.booking;
    this.host = data.host;
    this.participants = data.participants || [];
    this.status = data.status || 'scheduled';
    this.scheduledAt = data.scheduledAt || new Date().toISOString();
    this.startedAt = data.startedAt || null;
    this.endedAt = data.endedAt || null;
    this.duration = data.duration || 0;
    this.settings = data.settings || {
      enableVideo: true,
      enableAudio: true,
      enableScreenShare: true,
      enableChat: true,
      waitingRoom: false,
      recordMeeting: false
    };
    this.recording = data.recording || null;
    this.chatMessages = data.chatMessages || [];
    this.feedback = data.feedback || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save meeting to database
  async save() {
    this.updatedAt = new Date().toISOString();
    
    if (this._id) {
      // Update existing meeting
      const result = Meetings.updateOne({ _id: this._id }, { $set: this.toJSON() });
      return result.modifiedCount > 0 ? this : null;
    } else {
      // Create new meeting
      const newMeeting = Meetings.insertOne(this.toJSON());
      this._id = newMeeting._id;
      return this;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      _id: this._id,
      meetingId: this.meetingId,
      booking: this.booking,
      host: this.host,
      participants: this.participants,
      status: this.status,
      scheduledAt: this.scheduledAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      duration: this.duration,
      settings: this.settings,
      recording: this.recording,
      chatMessages: this.chatMessages,
      feedback: this.feedback,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Start meeting
  async start() {
    this.status = 'ongoing';
    this.startedAt = new Date().toISOString();
    return this.save();
  }

  // End meeting
  async end() {
    this.status = 'ended';
    this.endedAt = new Date().toISOString();
    if (this.startedAt) {
      const start = new Date(this.startedAt);
      const end = new Date(this.endedAt);
      this.duration = Math.round((end - start) / 60000); // Duration in minutes
    }
    return this.save();
  }

  // Add participant
  async addParticipant(userId, isHost = false) {
    const existingParticipant = this.participants.find(p => p.user === userId);
    if (!existingParticipant) {
      this.participants.push({
        user: userId,
        joinedAt: new Date().toISOString(),
        leftAt: null,
        isHost: isHost
      });
      return this.save();
    }
    return this;
  }

  // Remove participant
  async removeParticipant(userId) {
    const participant = this.participants.find(p => p.user === userId);
    if (participant) {
      participant.leftAt = new Date().toISOString();
      return this.save();
    }
    return this;
  }

  // Add chat message during meeting
  async addChatMessage(userId, message) {
    this.chatMessages.push({
      sender: userId,
      message: message,
      sentAt: new Date().toISOString()
    });
    return this.save();
  }

  // Add feedback
  async addFeedback(userId, rating, comment) {
    const existingFeedback = this.feedback.find(f => f.user === userId);
    if (existingFeedback) {
      existingFeedback.rating = rating;
      existingFeedback.comment = comment;
      existingFeedback.submittedAt = new Date().toISOString();
    } else {
      this.feedback.push({
        user: userId,
        rating: rating,
        comment: comment,
        submittedAt: new Date().toISOString()
      });
    }
    return this.save();
  }

  // Static methods
  static async findOne(filter) {
    const data = Meetings.findOne(filter);
    return data ? new Meeting(data) : null;
  }

  static async findById(id) {
    const data = Meetings.findById(id);
    return data ? new Meeting(data) : null;
  }

  static async find(filter = {}) {
    const data = Meetings.find(filter);
    return data.map(m => new Meeting(m));
  }

  static async create(meetingData) {
    const newMeeting = Meetings.insertOne(meetingData);
    return new Meeting(newMeeting);
  }

  static async updateOne(filter, update) {
    return Meetings.updateOne(filter, update);
  }

  static async updateMany(filter, update) {
    return Meetings.updateMany(filter, update);
  }

  static async deleteOne(filter) {
    return Meetings.deleteOne(filter);
  }

  static async countDocuments(filter = {}) {
    return Meetings.countDocuments(filter);
  }

  static async exists(filter) {
    return Meetings.findOne(filter) !== null;
  }

  // Generate unique meeting ID
  static generateMeetingId() {
    return 'mtg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = Meeting;
