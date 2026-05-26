const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Helper function to get user details
async function getUserDetails(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    role: user.role
  };
}

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get statistics
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    
    // Get today's bookings
    const allBookings = await Booking.find().exec();
    const todayBookings = allBookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= today;
    }).length;

    // Get booking status distribution
    const statusCounts = {};
    allBookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    const bookingStatusStats = Object.entries(statusCounts).map(([status, count]) => ({
      _id: status,
      count
    }));

    // Get bookings over last 30 days
    const last30DaysBookings = allBookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= thirtyDaysAgo;
    });
    
    const bookingsByDate = {};
    last30DaysBookings.forEach(b => {
      const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
      bookingsByDate[dateStr] = (bookingsByDate[dateStr] || 0) + 1;
    });
    
    const bookingsTrend = Object.entries(bookingsByDate)
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => a._id.localeCompare(b._id));

    // Get recent bookings with populated user data
    let recentBookings = await Booking.find().exec();
    recentBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentBookings = recentBookings.slice(0, 10);
    
    const populatedRecentBookings = await Promise.all(
      recentBookings.map(async (booking) => {
        const patient = await getUserDetails(booking.patient);
        return {
          ...booking.toJSON(),
          patient
        };
      })
    );

    // Get recent users
    let recentUsers = await User.find({ role: 'patient' }).exec();
    recentUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentUsers = recentUsers.slice(0, 10).map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      createdAt: u.createdAt
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalDoctors,
          totalBookings,
          pendingBookings,
          todayBookings
        },
        bookingStatusStats,
        bookingsTrend,
        recentBookings: populatedRecentBookings,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters (Admin only)
// @access  Private/Admin
router.get('/bookings', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    let bookings = await Booking.find({}).exec();
    
    // Apply filters
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    
    if (date) {
      const searchDate = new Date(date);
      bookings = bookings.filter(b => {
        if (!b.assignedDate) return false;
        const assignedDate = new Date(b.assignedDate);
        return assignedDate.toDateString() === searchDate.toDateString();
      });
    }

    const count = bookings.length;
    
    // Sort by createdAt descending
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    bookings = bookings.slice((page - 1) * limit, page * limit);
    
    // Populate user data
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const patient = await getUserDetails(booking.patient);
        const doctor = booking.doctor ? await getUserDetails(booking.doctor) : null;
        return {
          ...booking.toJSON(),
          patient,
          doctor
        };
      })
    );

    res.json({
      success: true,
      data: {
        bookings: populatedBookings,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters (Admin only)
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    let users = await User.find({}).exec();
    
    // Apply filters
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    if (isActive !== undefined) {
      const isActiveBool = isActive === 'true';
      users = users.filter(u => u.isActive === isActiveBool);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower)) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(searchLower))
      );
    }

    const count = users.length;
    
    // Sort by createdAt descending
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    users = users.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: {
        users: users.map(u => u.getPublicProfile()),
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/notifications/broadcast
// @desc    Send notification to all users or specific role
// @access  Private/Admin
router.post('/notifications/broadcast', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, message, targetRole, priority = 'medium' } = req.body;

    let targetUsers;
    if (targetRole) {
      targetUsers = await User.find({ role: targetRole, isActive: true }).exec();
    } else {
      targetUsers = await User.find({ isActive: true }).exec();
    }

    const notifications = await Promise.all(
      targetUsers.map(user =>
        Notification.create({
          recipient: user._id,
          sender: req.user._id,
          type: 'system_notification',
          title,
          message,
          priority
        })
      )
    );

    res.json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      data: { sentCount: notifications.length }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/doctors
// @desc    List doctors for booking assignment
// @access  Private/Admin
router.get('/doctors', protect, adminOnly, async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true }).exec();
    res.json({
      success: true,
      data: {
        doctors: doctors.map((d) => ({
          _id: d._id,
          fullName: d.fullName,
          email: d.email,
          specialization: d.specialization,
          profileImage: d.profileImage
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/messages/recent
// @desc    Recent platform messages (admin overview)
// @access  Private/Admin
router.get('/messages/recent', protect, adminOnly, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;
    let messages = await Message.find({});
    messages = messages
      .filter((m) => !m.isDeleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const sender = await getUserDetails(msg.sender);
        const receiver = await getUserDetails(msg.receiver);
        return { ...msg.toJSON(), sender, receiver };
      })
    );

    res.json({
      success: true,
      data: { messages: enriched }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
