const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// Helper function to populate notification data
async function populateNotification(notification) {
  const sender = notification.sender ? await User.findById(notification.sender) : null;
  const relatedBooking = notification.relatedBooking ? await Booking.findById(notification.relatedBooking) : null;
  
  return {
    ...notification.toJSON(),
    sender: sender ? sender.getPublicProfile() : null,
    relatedBooking: relatedBooking ? {
      _id: relatedBooking._id,
      status: relatedBooking.status,
      assignedDate: relatedBooking.assignedDate,
      assignedTime: relatedBooking.assignedTime
    } : null
  };
}

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let query = { recipient: req.user._id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    let notifications = await Notification.find(query);
    
    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const count = notifications.length;
    notifications = notifications.slice((page - 1) * limit, page * limit);
    
    // Populate notification data
    const populatedNotifications = await Promise.all(
      notifications.map(n => populateNotification(n))
    );
    
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        notifications: populatedNotifications,
        unreadCount,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    await notification.save();

    const populatedNotification = await populateNotification(notification);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification: populatedNotification }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date().toISOString() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
