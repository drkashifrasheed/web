const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's bookings
    const bookings = await Booking.find({ patient: req.user._id }).exec();

    res.json({
      success: true,
      data: {
        user: {
          ...user.getPublicProfile(),
          bookings: bookings.map(b => ({
            _id: b._id,
            status: b.status,
            assignedDate: b.assignedDate,
            assignedTime: b.assignedTime
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('fullName').optional().trim().notEmpty(),
    body('phoneNumber').optional().trim(),
    body('age').optional().isInt({ min: 0, max: 150 }),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const allowedUpdates = ['fullName', 'phoneNumber', 'age', 'gender'];

      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
          user[key] = req.body[key];
        }
      });

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/users/profile-image
// @desc    Update profile image
// @access  Private
router.put(
  '/profile-image',
  protect,
  upload.single('image'),
  handleMulterError,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // In production, upload to Cloudinary
      // For now, we'll use local path
      const imageUrl = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: imageUrl },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: { user: user ? user.getPublicProfile() : null }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get upcoming appointments
    const now = new Date().toISOString();
    const upcomingRaw = (await Booking.find({
      patient: userId,
      status: 'accepted'
    }).exec())
      .filter((b) => b.assignedDate && b.assignedDate >= now)
      .sort((a, b) => String(a.assignedDate).localeCompare(String(b.assignedDate)))
      .slice(0, 5);

    const upcomingAppointments = [];
    for (const b of upcomingRaw) {
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
      upcomingAppointments.push(json);
    }

    const allBookings = await Booking.find({ patient: userId }).exec();
    const stats = {
      total: allBookings.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      rejected: 0
    };
    allBookings.forEach((b) => {
      if (stats[b.status] !== undefined) stats[b.status]++;
    });

    const recentBookings = await Booking.findWithDoctor({ patient: userId }, 5);

    res.json({
      success: true,
      data: {
        upcomingAppointments,
        stats,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/doctors
// @desc    Get all doctors
// @access  Public
router.get('/doctors', async (req, res, next) => {
  try {
    const { search, specialization, page = 1, limit = 10 } = req.query;

    let query = { role: 'doctor', isActive: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      query.$text = { $search: search };
    }

    let doctors = await User.find(query).sort({ rating: -1 }).exec();

    if (search) {
      const term = String(search).toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.fullName?.toLowerCase().includes(term) ||
          d.specialization?.toLowerCase().includes(term)
      );
    }

    const count = doctors.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    doctors = doctors.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: {
        doctors: doctors.map((d) => d.getPublicProfile()),
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/doctors/:id
// @desc    Get single doctor details
// @access  Public
router.get('/doctors/:id', async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: { doctor: doctor.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res, next) => {
  try {
    // Soft delete - mark as inactive
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    let users = await User.find(query).sort({ createdAt: -1 }).exec();
    const count = users.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    users = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: {
        users: users.map((u) => u.getPublicProfile()),
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/doctors
// @desc    Create a new doctor (Admin only)
// @access  Private/Admin
router.post(
  '/doctors',
  protect,
  adminOnly,
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('specialization').trim().notEmpty(),
    body('qualifications').optional().isArray(),
    body('experience').optional().isNumeric(),
    body('consultationFee').optional().isNumeric()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const doctorData = {
        ...req.body,
        role: 'doctor',
        isEmailVerified: true,
        qualifications: req.body.qualifications || [],
        experience: req.body.experience || 0,
        consultationFee: req.body.consultationFee || 0
      };

      const doctor = await User.create(doctorData);

      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: { doctor: doctor.getPublicProfile() }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, { isActive });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
