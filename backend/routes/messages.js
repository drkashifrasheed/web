const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const Booking = require('../models/Booking');
const { notifyUser } = require('../utils/bookingNotifications');

async function canPatientSendMessage(senderId, receiverId, bookingId) {
  if (!bookingId) return { ok: false, message: 'Booking context required for patient messages during consultation' };

  const booking = await Booking.findById(bookingId);
  if (!booking) return { ok: false, message: 'Booking not found' };
  if (booking.patient !== senderId.toString()) {
    return { ok: false, message: 'Not your booking' };
  }
  if (booking.videoCallStatus === 'active') {
    return { ok: true, booking };
  }
  return {
    ok: false,
    message: 'You can only send messages during an active video consultation'
  };
}

// Helper function to get user details
async function getUserDetails(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return {
    _id: user._id,
    fullName: user.fullName,
    profileImage: user.profileImage,
    role: user.role
  };
}

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Get all messages for this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Sort by createdAt descending
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      const partnerId = msg.sender === userId 
        ? msg.receiver 
        : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        const partner = await getUserDetails(partnerId);
        if (partner) {
          conversationsMap.set(partnerId, {
            partner,
            lastMessage: msg,
            unreadCount: 0
          });
        }
      }

      // Count unread messages
      if (msg.receiver === userId && !msg.isRead) {
        const conv = conversationsMap.get(partnerId);
        if (conv) {
          conv.unreadCount++;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and another user
// @access  Private
router.get('/:userId', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user._id.toString();
    const otherUserId = req.params.userId;

    // Get messages between users
    let messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });

    // Sort by createdAt descending for pagination
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    messages = messages.slice((page - 1) * limit, page * limit);

    // Populate sender and receiver details
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await getUserDetails(msg.sender);
        const receiver = await getUserDetails(msg.receiver);
        return {
          ...msg.toJSON(),
          sender,
          receiver
        };
      })
    );

    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => msg.receiver === currentUserId && !msg.isRead
    );
    
    for (const msg of unreadMessages) {
      msg.isRead = true;
      msg.readAt = new Date().toISOString();
      await msg.save();
    }

    // Get other user details
    const otherUser = await getUserDetails(otherUserId);

    res.json({
      success: true,
      data: {
        messages: populatedMessages.reverse(),
        otherUser
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/:userId
// @desc    Send message to another user
// @access  Private
router.post(
  '/:userId',
  protect,
  upload.single('image'),
  handleMulterError,
  async (req, res, next) => {
    try {
      const senderId = req.user._id.toString();
      const receiverId = req.params.userId;
      const bookingId = req.body.bookingId || null;
      const content = (req.body.content || '').trim();
      const messageType = req.file ? 'image' : req.body.messageType || 'text';

      if (!content && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Message content or image is required'
        });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'Receiver not found'
        });
      }

      if (req.user.role === 'patient') {
        const check = await canPatientSendMessage(senderId, receiverId, bookingId);
        if (!check.ok) {
          return res.status(403).json({ success: false, message: check.message });
        }
      }

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        bookingId,
        content: content || (req.file ? 'Image' : ''),
        messageType,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl || '',
        fileName: req.file?.originalname || '',
        isRead: false
      });

      if (req.user.role === 'admin' || req.user.role === 'doctor') {
        await notifyUser(receiverId, {
          senderId,
          type: 'message_received',
          title: 'New message from clinic',
          message: content || 'You received an image',
          bookingId,
          actionUrl: bookingId ? `/video-call/${bookingId}` : '/chat',
          priority: 'medium'
        });
      }

      const populatedMessage = {
        ...message.toJSON(),
        sender: {
          _id: req.user._id,
          fullName: req.user.fullName,
          profileImage: req.user.profileImage,
          role: req.user.role
        },
        receiver: {
          _id: receiver._id,
          fullName: receiver.fullName,
          profileImage: receiver.profileImage,
          role: receiver.role
        }
      };

      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: { message: populatedMessage }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      receiver: req.user._id.toString()
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.isRead = true;
    message.readAt = new Date().toISOString();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user._id.toString()
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
