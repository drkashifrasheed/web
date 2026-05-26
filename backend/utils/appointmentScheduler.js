const Booking = require('../models/Booking');
const User = require('../models/User');
const Message = require('../models/Message');
const { notifyUser, buildScheduledLabel } = require('./bookingNotifications');

let schedulerIo = null;

function setSchedulerIo(io) {
  schedulerIo = io;
}

function emitToUser(userId, event, data) {
  if (schedulerIo) {
    schedulerIo.to(`user_${userId}`).emit(event, data);
  }
}

async function checkAppointmentReminders() {
  const now = new Date();
  const bookings = await Booking.find({ status: 'accepted' }).exec();

  for (const booking of bookings) {
    if (!booking.scheduledAt || booking.timeReminderSent) continue;

    const scheduled = new Date(booking.scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();

    if (diffMs <= 0 && diffMs > -15 * 60 * 1000) {
      booking.timeReminderSent = true;
      await booking.save();

      const label = buildScheduledLabel(booking);
      const patientId = booking.patient;

      await notifyUser(patientId, {
        type: 'appointment_time',
        title: 'Appointment time is now',
        message: `Your consultation is scheduled for ${label}. Please join when the doctor starts the video call.`,
        bookingId: booking._id,
        actionUrl: '/profile',
        priority: 'high'
      });

      const admins = await User.find({ role: 'admin', isActive: true }).exec();
      for (const admin of admins) {
        await Message.create({
          sender: admin._id,
          receiver: patientId,
          bookingId: booking._id,
          content: `Your appointment time (${label}) has started. The doctor will connect with you shortly for your video consultation.`,
          messageType: 'text'
        });

        await notifyUser(patientId, {
          senderId: admin._id,
          type: 'appointment_time',
          title: 'Doctor message',
          message: `Appointment time: ${label}. Please be ready for video consultation.`,
          bookingId: booking._id,
          actionUrl: '/chat',
          priority: 'high'
        });

        emitToUser(patientId, 'appointment_time', { bookingId: booking._id, scheduledAt: booking.scheduledAt });
      }
    }
  }
}

function startAppointmentScheduler() {
  setInterval(checkAppointmentReminders, 60 * 1000);
  console.log('⏰ Appointment reminder scheduler started');
}

module.exports = {
  startAppointmentScheduler,
  setSchedulerIo,
  checkAppointmentReminders
};
