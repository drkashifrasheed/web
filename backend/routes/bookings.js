const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');
const { generateOTP, sendBookingCancellationEmail, sendBookingAcceptedEmail, sendVideoCallRequestEmail } = require('../utils/emailService');
const { upload, handleMulterError } = require('../middleware/upload');
const Meeting = require('../models/Meeting');
const { notifyUser, notifyAdmins, buildScheduledLabel } = require('../utils/bookingNotifications');

function parseScheduledDateTime(assignedDate, assignedTime, timePeriod) {
  if (!assignedDate) return null;
  let time = assignedTime || '10:00';
  const period = (timePeriod || 'AM').toUpperCase();
  const match = String(time).match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    time = `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  const iso = new Date(`${assignedDate}T${time}:00`);
  return isNaN(iso.getTime()) ? null : iso.toISOString();
}

function getPaymentConfig() {
  return {
    bankName: process.env.PAYMENT_BANK_NAME || 'Bank Alfalah',
    accountTitle: process.env.PAYMENT_ACCOUNT_TITLE || 'Dr Mahar Kashif Rasheed',
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || '01234567890123',
    amount: parseFloat(process.env.PAYMENT_AMOUNT || '2000'),
    instructions:
      process.env.PAYMENT_INSTRUCTIONS ||
      'Transfer the consultation fee and upload payment screenshot below.'
  };
}

// Patient display uses booking.patientInfo only (medical data is per-booking, not on user profile)
async function populateBooking(booking) {
  const patientUser = await User.findById(booking.patient);
  const doctor = booking.doctor ? await User.findById(booking.doctor) : null;
  const info = booking.patientInfo || {};

  const patient = {
    _id: patientUser?._id || booking.patient,
    fullName: info.fullName || patientUser?.fullName,
    phoneNumber: info.phoneNumber || patientUser?.phoneNumber,
    profileImage: patientUser?.profileImage,
    age: info.age,
    weight: info.weight,
    gender: info.gender,
    location: info.location,
    allergies: info.allergies,
    medicalHistory: info.medicalHistory,
    currentMedications: info.currentMedications
  };

  return {
    ...booking.toJSON(),
    patient,
    doctor: doctor ? doctor.getPublicProfile() : null
  };
}

// Helper function to populate multiple bookings
async function populateBookings(bookings) {
  return Promise.all(bookings.map(booking => populateBooking(booking)));
}

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  '/',
  protect,
  [
    body('patientInfo.fullName').trim().notEmpty().withMessage('Full name is required'),
    body('patientInfo.age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
    body('patientInfo.phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('patientInfo.location').trim().notEmpty().withMessage('Location is required'),
    body('medicalProblem').trim().notEmpty().withMessage('Medical problem is required'),
    body('appointmentType').isIn(['in-person', 'video-consultation', 'phone-consultation']).withMessage('Valid appointment type is required'),
    body('preferredTime').trim().notEmpty().withMessage('Preferred time is required')
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

      const pay = getPaymentConfig();
      const bookingData = {
        patient: req.user._id,
        ...req.body,
        status: 'pending',
        paymentStatus: 'awaiting_payment',
        amount: pay.amount
      };

      const booking = await Booking.create(bookingData);

      // Populate patient info
      const populatedBooking = await populateBooking(booking);

      // Create notification for admin
      await Notification.create({
        recipient: null, // null means all admins
        sender: req.user._id,
        type: 'booking_created',
        title: 'New Booking Request',
        message: `${req.user.fullName} has requested a new appointment`,
        relatedBooking: booking._id,
        priority: 'high'
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          booking: populatedBooking,
          payment: getPaymentConfig()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // If user is patient, show their bookings
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }
    // If user is doctor, show bookings assigned to them
    else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // Admin can see all bookings
    
    if (status) {
      query.status = status;
    }

    let bookings = await Booking.find(query).exec();
    
    // Sort by createdAt descending
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const count = bookings.length;
    bookings = bookings.slice((page - 1) * limit, page * limit);
    
    // Populate user data
    const populatedBookings = await populateBookings(bookings);

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

// @route   GET /api/bookings/config/payment
router.get('/config/payment', protect, async (req, res) => {
  res.json({ success: true, data: getPaymentConfig() });
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view this booking
    const isAuthorized =
      req.user.role === 'admin' ||
      booking.patient === req.user._id.toString() ||
      (booking.doctor && booking.doctor.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    const populatedBooking = await populateBooking(booking);

    res.json({
      success: true,
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      status,
      assignedDate,
      assignedTime,
      timePeriod,
      doctorId,
      meetingLink,
      adminNotes,
      rejectionReason
    } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;

    if (status === 'accepted') {
      const displayTime = assignedTime
        ? `${assignedTime} ${(timePeriod || 'AM').toUpperCase()}`
        : '';
      booking.assignedDate = assignedDate || booking.assignedDate;
      booking.assignedTime = displayTime || booking.assignedTime;
      booking.scheduledAt = parseScheduledDateTime(
        assignedDate || booking.assignedDate,
        assignedTime,
        timePeriod
      );
      booking.doctor = doctorId || booking.doctor;
      booking.meetingId = booking.meetingId || Meeting.generateMeetingId();
      booking.meetingLink = meetingLink || `/video-call/${booking._id}`;
      booking.adminNotes = adminNotes;
      booking.respondedAt = new Date().toISOString();
      booking.timeReminderSent = false;

      const label = buildScheduledLabel(booking);
      
      // Send website notification
      await notifyUser(booking.patient, {
        senderId: req.user._id,
        type: 'booking_accepted',
        title: 'Booking Accepted',
        message: `Your appointment is confirmed for ${label}. You can view details in your profile.`,
        bookingId: booking._id,
        actionUrl: '/profile',
        priority: 'high'
      });

      // Send email notification with appointment details
      const patientUser = await User.findById(booking.patient);
      if (patientUser && patientUser.email) {
        await sendBookingAcceptedEmail(
          patientUser.email,
          patientUser.fullName,
          {
            assignedDate: booking.assignedDate,
            assignedTime: booking.assignedTime,
            medicalProblem: booking.medicalProblem,
            adminNotes: booking.adminNotes
          }
        );
      }
    } else if (status === 'rejected') {
      booking.rejectionReason = rejectionReason;
      booking.respondedAt = new Date().toISOString();
      await notifyUser(booking.patient, {
        senderId: req.user._id,
        type: 'booking_rejected',
        title: 'Booking Rejected',
        message: rejectionReason || 'Your booking request has been rejected',
        bookingId: booking._id,
        actionUrl: '/profile',
        priority: 'medium'
      });
    } else if (status === 'completed') {
      booking.completedAt = new Date().toISOString();
      await notifyUser(booking.patient, {
        senderId: req.user._id,
        type: 'booking_completed',
        title: 'Appointment Completed',
        message: 'Your appointment has been marked as completed. Thank you!',
        bookingId: booking._id,
        actionUrl: '/profile',
        priority: 'low'
      });
    }

    await booking.save();

    const populatedBooking = await populateBooking(booking);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/prescription
// @desc    Add prescription to booking
// @access  Private/Doctor
router.put('/:id/prescription', protect, async (req, res, next) => {
  try {
    const { diagnosis, medications, advice, followUpDate } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only assigned doctor or admin can add prescription
    const isAuthorized = 
      req.user.role === 'admin' ||
      (booking.doctor && booking.doctor.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription'
      });
    }

    booking.prescription = {
      diagnosis,
      medications,
      advice,
      followUpDate,
      issuedAt: new Date()
    };

    await booking.save();

    // Create notification for patient
    await Notification.create({
      recipient: booking.patient,
      type: 'prescription_added',
      title: 'Prescription Added',
      message: 'A prescription has been added to your appointment',
      relatedBooking: booking._id,
      priority: 'high'
    });

    const populatedBooking = await populateBooking(booking);

    res.json({
      success: true,
      message: 'Prescription added successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/review
// @desc    Add review to completed booking
// @access  Private
router.post('/:id/review', protect, async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only patient who booked can review
    if (booking.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Can only review completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed appointments'
      });
    }

    booking.rating = rating;
    booking.review = review;
    booking.reviewedAt = new Date();

    await booking.save();

    // Update doctor's average rating
    if (booking.doctor) {
      const doctorBookings = await Booking.find({
        doctor: booking.doctor
      }).exec();
      
      const ratedBookings = doctorBookings.filter(b => b.rating !== null && b.rating !== undefined);

      if (ratedBookings.length > 0) {
        const avgRating = ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length;
        
        const doctor = await User.findById(booking.doctor);
        if (doctor) {
          doctor.rating = Math.round(avgRating * 10) / 10;
          doctor.totalReviews = ratedBookings.length;
          await doctor.save();
        }
      }
    }

    const populatedBooking = await populateBooking(booking);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/send-cancel-otp
// @desc    Send OTP for booking cancellation verification
// @access  Private
router.post('/:id/send-cancel-otp', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed bookings'
      });
    }

    const user = await User.findById(req.user._id);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP
    user.bookingCancelOTP = otp;
    user.bookingCancelOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendBookingCancellationEmail(user.email, otp, user.fullName, {
      medicalProblem: booking.medicalProblem,
      appointmentType: booking.appointmentType
    });

    res.status(200).json({
      success: true,
      message: 'Cancellation verification code sent to your email',
      data: {
        email: user.email,
        expiresIn: 600
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/verify-cancel-otp
// @desc    Verify OTP and cancel booking
// @access  Private
router.post('/:id/verify-cancel-otp', protect, async (req, res, next) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    const user = await User.findById(req.user._id);

    // Verify OTP
    if (user.bookingCancelOTP !== otp || user.bookingCancelOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Clear OTP
    user.bookingCancelOTP = null;
    user.bookingCancelOTPExpires = null;
    await user.save();

    // Cancel booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = 'Cancelled by patient';
    await booking.save();

    // Create notification for admin
    await Notification.create({
      recipient: null,
      sender: req.user._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${req.user.fullName} has cancelled their booking`,
      relatedBooking: booking._id,
      priority: 'medium'
    });

    const populatedBooking = await populateBooking(booking);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/payment-proof
router.post(
  '/:id/payment-proof',
  protect,
  upload.single('proof'),
  handleMulterError,
  async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.patient !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Payment proof image required' });
      }

      booking.paymentProofUrl = `/uploads/${req.file.filename}`;
      booking.paymentProofUploadedAt = new Date().toISOString();
      booking.paymentStatus = 'proof_submitted';
      await booking.save();

      await notifyAdmins({
        senderId: req.user._id,
        type: 'payment_proof',
        title: 'Payment proof uploaded',
        message: `${req.user.fullName} uploaded payment proof for booking #${booking._id}`,
        bookingId: booking._id,
        priority: 'high'
      });

      res.json({
        success: true,
        message: 'Payment proof uploaded. Admin will verify shortly.',
        data: { booking: await populateBooking(booking) }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/bookings/:id/request-video-call — admin
router.post('/:id/request-video-call', protect, adminOnly, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted before video call'
      });
    }

    booking.videoCallStatus = 'requested';
    booking.videoCallRequestedAt = new Date().toISOString();
    booking.meetingId = booking.meetingId || Meeting.generateMeetingId();
    await booking.save();

    const videoCallUrl = `/video-call/${booking._id}`;

    // 1. Website notification with direct video call link
    await notifyUser(booking.patient, {
      senderId: req.user._id,
      type: 'video_call_request',
      title: '📹 Video Call Request',
      message: 'Dr. Mahar Kashif Rasheed invited you to a video consultation. Click to join instantly!',
      bookingId: booking._id,
      actionUrl: videoCallUrl,
      priority: 'high'
    });

    // 2. In-app message notification
    await Message.create({
      sender: req.user._id,
      receiver: booking.patient,
      bookingId: booking._id,
      content: `📹 Video consultation request from Dr. Mahar Kashif Rasheed. Click here to join: ${process.env.CLIENT_URL}${videoCallUrl}`,
      messageType: 'video_call_request'
    });

    // 3. Email notification with direct join link
    const patientUser = await User.findById(booking.patient);
    if (patientUser && patientUser.email) {
      await sendVideoCallRequestEmail(
        patientUser.email,
        patientUser.fullName,
        {
          bookingId: booking._id,
          medicalProblem: booking.medicalProblem
        }
      );
    }

    // 4. SMS notification (if phone number available)
    if (patientUser && patientUser.phoneNumber) {
      // SMS notification placeholder - integrate with SMS service
      console.log(`📱 SMS notification would be sent to: ${patientUser.phoneNumber}`);
      console.log(`   Message: Video call request from Dr. Mahar. Join: ${process.env.CLIENT_URL}${videoCallUrl}`);
    }

    res.json({
      success: true,
      message: 'Video call request sent via email, SMS, and website notification',
      data: {
        booking: await populateBooking(booking),
        videoCallUrl: `${process.env.CLIENT_URL}${videoCallUrl}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/accept-video-call — patient
router.post('/:id/accept-video-call', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.patient !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.videoCallStatus !== 'requested') {
      return res.status(400).json({ success: false, message: 'No pending video call request' });
    }

    booking.videoCallStatus = 'accepted';
    booking.videoCallAcceptedAt = new Date().toISOString();
    await booking.save();

    let meeting = await Meeting.findOne({ booking: booking._id });
    if (!meeting) {
      meeting = await Meeting.create({
        meetingId: booking.meetingId,
        booking: booking._id,
        host: req.user._id,
        participants: [],
        status: 'scheduled'
      });
    }

    res.json({
      success: true,
      message: 'Video call accepted',
      data: {
        booking: await populateBooking(booking),
        meetingId: booking.meetingId,
        joinUrl: `/video-call/${booking._id}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/start-video-call
router.post('/:id/start-video-call', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParty =
      req.user.role === 'admin' ||
      booking.patient === req.user._id.toString() ||
      (booking.doctor && booking.doctor.toString() === req.user._id.toString());

    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['accepted', 'active'].includes(booking.videoCallStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Video call must be accepted first'
      });
    }

    booking.videoCallStatus = 'active';
    await booking.save();

    let meeting = await Meeting.findOne({ booking: booking._id });
    if (!meeting) {
      meeting = await Meeting.create({
        meetingId: booking.meetingId || Meeting.generateMeetingId(),
        booking: booking._id,
        host: req.user._id,
        status: 'ongoing'
      });
    } else {
      await meeting.start();
    }

    res.json({
      success: true,
      data: {
        roomId: `booking_${booking._id}`,
        booking: await populateBooking(booking)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/:id/end-video-call
router.post('/:id/end-video-call', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.videoCallStatus = 'ended';
    await booking.save();

    const meeting = await Meeting.findOne({ booking: booking._id });
    if (meeting) await meeting.end();

    res.json({
      success: true,
      message: 'Video call ended',
      data: { booking: await populateBooking(booking) }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
