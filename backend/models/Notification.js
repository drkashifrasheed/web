const { Notifications } = require('../utils/fileDatabase');

// Notification model using file-based storage
class Notification {
  constructor(data) {
    this._id = data._id;
    this.recipient = data.recipient;
    this.sender = data.sender || null;
    this.type = data.type || 'system_notification';
    this.title = data.title || '';
    this.message = data.message || '';
    this.relatedBooking = data.relatedBooking || null;
    this.relatedMessage = data.relatedMessage || null;
    this.meetingLink = data.meetingLink || '';
    this.isRead = data.isRead || false;
    this.readAt = data.readAt || null;
    this.actionUrl = data.actionUrl || '';
    this.priority = data.priority || 'medium';
    this.sentPush = data.sentPush || false;
    this.sentEmail = data.sentEmail || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save notification to database
  async save() {
    this.updatedAt = new Date().toISOString();
    
    if (this._id) {
      // Update existing notification
      const result = Notifications.updateOne({ _id: this._id }, { $set: this.toJSON() });
      return result.modifiedCount > 0 ? this : null;
    } else {
      // Create new notification
      const newNotification = Notifications.insertOne(this.toJSON());
      this._id = newNotification._id;
      return this;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      _id: this._id,
      recipient: this.recipient,
      sender: this.sender,
      type: this.type,
      title: this.title,
      message: this.message,
      relatedBooking: this.relatedBooking,
      relatedMessage: this.relatedMessage,
      meetingLink: this.meetingLink,
      isRead: this.isRead,
      readAt: this.readAt,
      actionUrl: this.actionUrl,
      priority: this.priority,
      sentPush: this.sentPush,
      sentEmail: this.sentEmail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Mark as read
  async markAsRead() {
    this.isRead = true;
    this.readAt = new Date().toISOString();
    return this.save();
  }

  // Mark all as read for a user
  static async markAllAsRead(userId) {
    return Notifications.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date().toISOString() } }
    );
  }

  // Static methods
  static async findOne(filter) {
    const data = Notifications.findOne(filter);
    return data ? new Notification(data) : null;
  }

  static async findById(id) {
    const data = Notifications.findById(id);
    return data ? new Notification(data) : null;
  }

  static async find(filter = {}) {
    const data = Notifications.find(filter);
    return data.map(n => new Notification(n));
  }

  static async create(notificationData) {
    const newNotification = Notifications.insertOne(notificationData);
    return new Notification(newNotification);
  }

  static async updateOne(filter, update) {
    return Notifications.updateOne(filter, update);
  }

  static async updateMany(filter, update) {
    return Notifications.updateMany(filter, update);
  }

  static async deleteOne(filter) {
    return Notifications.deleteOne(filter);
  }

  static async deleteMany(filter) {
    const data = Notifications.find(filter);
    let deletedCount = 0;
    data.forEach(n => {
      Notifications.deleteOne({ _id: n._id });
      deletedCount++;
    });
    return { deletedCount };
  }

  static async countDocuments(filter = {}) {
    return Notifications.countDocuments(filter);
  }

  // Get notifications for user
  static async getForUser(userId, limit = 50, includeRead = false) {
    const filter = { recipient: userId };
    if (!includeRead) {
      filter.isRead = false;
    }
    
    const notifications = Notifications.find(filter);
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(n => new Notification(n));
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    return Notifications.countDocuments({
      recipient: userId,
      isRead: false
    });
  }
}

module.exports = Notification;
