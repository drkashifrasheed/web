const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message, Notification } = require('../models');

// Store connected users
const connectedUsers = new Map();

const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date().toISOString()
    });

    // Broadcast user online status to friends/contacts
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // ===== CHAT EVENTS =====

    // Join chat room
    socket.on('join_chat', (data) => {
      const { receiverId } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');
      socket.join(roomId);
      console.log(`User ${socket.userId} joined chat room ${roomId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (data) => {
      const { receiverId } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');
      socket.leave(roomId);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, messageType = 'text', fileUrl, fileName, replyTo } = data;

        // Save message to database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
          fileUrl,
          fileName,
          replyTo
        });

        await message.populate('sender receiver', 'fullName profileImage');

        // Create room ID
        const roomId = [socket.userId, receiverId].sort().join('_');

        // Emit to room
        io.to(roomId).emit('new_message', {
          message,
          roomId
        });

        // Emit to receiver's personal room if not in chat
        const receiverSocket = connectedUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('notification_message', {
            message,
            sender: socket.user
          });
        }

        // Create notification for receiver
        await Notification.create({
          recipient: receiverId,
          sender: socket.userId,
          type: 'message_received',
          title: 'New Message',
          message: `${socket.user.fullName} sent you a message`,
          relatedMessage: message._id,
          priority: 'medium'
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');
      
      socket.to(roomId).emit('typing', {
        userId: socket.userId,
        isTyping
      });
    });

    // Mark message as read
    socket.on('mark_read', async (data) => {
      try {
        const { messageId, senderId } = data;

        const msg = await Message.findById(messageId);
        if (msg) {
          msg.isRead = true;
          msg.readAt = new Date().toISOString();
          await msg.save();
        }

        // Notify sender that message was read
        const senderSocket = connectedUsers.get(senderId);
        if (senderSocket) {
          io.to(senderSocket.socketId).emit('message_read', {
            messageId,
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // ===== WEBRTC VIDEO CALL EVENTS =====

    // Join video call room
    socket.on('join_video_room', (data) => {
      const { roomId } = data;
      socket.join(roomId);
      console.log(`User ${socket.userId} joined video room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined_video', {
        userId: socket.userId,
        user: socket.user
      });
    });

    // Leave video call room
    socket.on('leave_video_room', (data) => {
      const { roomId } = data;
      socket.leave(roomId);
      socket.to(roomId).emit('user_left_video', {
        userId: socket.userId
      });
    });

    // WebRTC signaling - Offer
    socket.on('video_offer', (data) => {
      const { roomId, offer, targetUserId } = data;
      
      const targetSocket = connectedUsers.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket.socketId).emit('video_offer', {
          offer,
          senderId: socket.userId,
          roomId
        });
      }
    });

    // WebRTC signaling - Answer
    socket.on('video_answer', (data) => {
      const { roomId, answer, targetUserId } = data;
      
      const targetSocket = connectedUsers.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket.socketId).emit('video_answer', {
          answer,
          senderId: socket.userId,
          roomId
        });
      }
    });

    // WebRTC signaling - ICE Candidate
    socket.on('ice_candidate', (data) => {
      const { roomId, candidate, targetUserId } = data;
      
      const targetSocket = connectedUsers.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket.socketId).emit('ice_candidate', {
          candidate,
          senderId: socket.userId,
          roomId
        });
      }
    });

    // Video call controls
    socket.on('video_mute', (data) => {
      const { roomId, isMuted } = data;
      socket.to(roomId).emit('user_muted', {
        userId: socket.userId,
        isMuted
      });
    });

    socket.on('video_camera', (data) => {
      const { roomId, isCameraOn } = data;
      socket.to(roomId).emit('user_camera', {
        userId: socket.userId,
        isCameraOn
      });
    });

    socket.on('screen_share', (data) => {
      const { roomId, isSharing } = data;
      socket.to(roomId).emit('user_screen_share', {
        userId: socket.userId,
        isSharing
      });
    });

    // End call
    socket.on('end_call', async (data) => {
      const { roomId, bookingId } = data;
      socket.to(roomId).emit('call_ended', {
        endedBy: socket.userId
      });
      if (bookingId) {
        const Booking = require('../models/Booking');
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.videoCallStatus = 'ended';
          await booking.save();
        }
      }
    });

    // In-call chat (booking scoped)
    socket.on('call_chat_message', async (data) => {
      try {
        const { bookingId, receiverId, content, messageType = 'text', fileUrl, fileName } = data;

        if (socket.user.role === 'patient') {
          const Booking = require('../models/Booking');
          const booking = await Booking.findById(bookingId);
          if (!booking || booking.videoCallStatus !== 'active') {
            return socket.emit('error', { message: 'Chat only during active video call' });
          }
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          bookingId,
          content,
          messageType,
          fileUrl: fileUrl || '',
          fileName: fileName || ''
        });

        const roomId = `booking_${bookingId}`;
        io.to(roomId).emit('call_chat_message', {
          message: {
            ...message.toJSON(),
            sender: {
              _id: socket.user._id,
              fullName: socket.user.fullName,
              profileImage: socket.user.profileImage,
              role: socket.user.role
            }
          }
        });

        io.to(`user_${receiverId}`).emit('notification_message', {
          message,
          sender: socket.user
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send call message' });
      }
    });

    socket.on('join_booking_call', (data) => {
      const { bookingId } = data;
      const roomId = `booking_${bookingId}`;
      socket.join(roomId);
      socket.to(roomId).emit('user_joined_call', {
        userId: socket.userId,
        user: {
          _id: socket.user._id,
          fullName: socket.user.fullName,
          profileImage: socket.user.profileImage,
          role: socket.user.role
        }
      });
    });

    // ===== NOTIFICATION EVENTS =====

    // Send notification to specific user
    socket.on('send_notification', async (data) => {
      try {
        const { recipientId, notification } = data;

        // Create notification in database
        const newNotification = await Notification.create({
          recipient: recipientId,
          sender: socket.userId,
          ...notification
        });

        await newNotification.populate('sender', 'fullName profileImage');

        // Emit to recipient's room
        io.to(`user_${recipientId}`).emit('new_notification', {
          notification: newNotification
        });

      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    // Mark notification as read
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;

        await Notification.findByIdAndUpdate(notificationId, {
          isRead: true,
          readAt: new Date()
        });

        socket.emit('notification_read', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // ===== DISCONNECT =====

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null
      });

      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });
  });

  return io;
};

// Helper function to get connected users
const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

module.exports = initializeSocketIO;
module.exports.getConnectedUsers = getConnectedUsers;
module.exports.isUserOnline = isUserOnline;