const { Messages } = require('../utils/fileDatabase');
const User = require('./User');

// Message model using file-based storage
class Message {
  constructor(data) {
    this._id = data._id;
    this.sender = data.sender;
    this.receiver = data.receiver;
    this.bookingId = data.bookingId || null;
    this.chatRoom = data.chatRoom || null;
    this.messageType = data.messageType || 'text';
    this.content = data.content || '';
    this.fileUrl = data.fileUrl || '';
    this.fileName = data.fileName || '';
    this.fileSize = data.fileSize || 0;
    this.isRead = data.isRead || false;
    this.readAt = data.readAt || null;
    this.replyTo = data.replyTo || null;
    this.isEdited = data.isEdited || false;
    this.editedAt = data.editedAt || null;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.reactions = data.reactions || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save message to database
  async save() {
    this.updatedAt = new Date().toISOString();
    
    if (this._id) {
      // Update existing message
      const result = Messages.updateOne({ _id: this._id }, { $set: this.toJSON() });
      return result.modifiedCount > 0 ? this : null;
    } else {
      // Create new message
      const newMessage = Messages.insertOne(this.toJSON());
      this._id = newMessage._id;
      return this;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      _id: this._id,
      sender: this.sender,
      receiver: this.receiver,
      bookingId: this.bookingId,
      chatRoom: this.chatRoom,
      messageType: this.messageType,
      content: this.content,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      fileSize: this.fileSize,
      isRead: this.isRead,
      readAt: this.readAt,
      replyTo: this.replyTo,
      isEdited: this.isEdited,
      editedAt: this.editedAt,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      reactions: this.reactions,
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

  // Add reaction
  async addReaction(userId, emoji) {
    const existingReaction = this.reactions.find(r => r.user === userId);
    if (existingReaction) {
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date().toISOString();
    } else {
      this.reactions.push({
        user: userId,
        emoji: emoji,
        createdAt: new Date().toISOString()
      });
    }
    return this.save();
  }

  // Remove reaction
  async removeReaction(userId) {
    this.reactions = this.reactions.filter(r => r.user !== userId);
    return this.save();
  }

  async populate(paths) {
    const fields = ['fullName', 'profileImage'];
    const pick = (user) =>
      user
        ? {
            _id: user._id,
            fullName: user.fullName,
            profileImage: user.profileImage
          }
        : null;

    if (this.sender) {
      const sender = await User.findById(this.sender);
      this.sender = pick(sender);
    }
    if (this.receiver) {
      const receiver = await User.findById(this.receiver);
      this.receiver = pick(receiver);
    }
    return this;
  }

  // Soft delete
  async softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date().toISOString();
    return this.save();
  }

  // Static methods
  static async findOne(filter) {
    const data = Messages.findOne(filter);
    return data ? new Message(data) : null;
  }

  static async findById(id) {
    const data = Messages.findById(id);
    return data ? new Message(data) : null;
  }

  static async find(filter = {}) {
    const data = Messages.find(filter);
    return data.map(m => new Message(m));
  }

  static async create(messageData) {
    const newMessage = Messages.insertOne(messageData);
    return new Message(newMessage);
  }

  static async updateOne(filter, update) {
    return Messages.updateOne(filter, update);
  }

  static async updateMany(filter, update) {
    return Messages.updateMany(filter, update);
  }

  static async deleteOne(filter) {
    return Messages.deleteOne(filter);
  }

  static async countDocuments(filter = {}) {
    return Messages.countDocuments(filter);
  }

  // Get conversation between two users
  static async getConversation(user1Id, user2Id, limit = 50) {
    const messages = Messages.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id }
      ]
    });
    
    return messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .reverse()
      .map(m => new Message(m));
  }

  // Get chat room messages
  static async getChatRoomMessages(chatRoomId, limit = 50) {
    const messages = Messages.find({ chatRoom: chatRoomId });
    
    return messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .reverse()
      .map(m => new Message(m));
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    return Messages.countDocuments({
      receiver: userId,
      isRead: false
    });
  }
}

module.exports = Message;
