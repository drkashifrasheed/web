const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendGenericEmail } = require('./emailService');

async function notifyUser(userId, payload) {
  await Notification.create({
    recipient: userId,
    sender: payload.senderId || null,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    relatedBooking: payload.bookingId || null,
    priority: payload.priority || 'medium',
    actionUrl: payload.actionUrl || null
  });

  const user = await User.findById(userId);
  if (user?.email) {
    try {
      await sendGenericEmail({
        to: user.email,
        subject: payload.title,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>${payload.title}</h2>
          <p>${payload.message}</p>
          ${payload.actionUrl ? `<p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}${payload.actionUrl}">Open in app</a></p>` : ''}
        </div>`
      });
    } catch (e) {
      console.warn('Email notify failed:', e.message);
    }
  }
}

async function notifyAdmins(payload) {
  const list = await User.find({ role: 'admin', isActive: true }).exec();
  for (const admin of list) {
    await notifyUser(admin._id, { ...payload, senderId: payload.senderId });
  }
}

function buildScheduledLabel(booking) {
  if (!booking.assignedDate) return 'To be confirmed';
  const date = new Date(booking.assignedDate).toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${date}${booking.assignedTime ? ` at ${booking.assignedTime}` : ''}`;
}

module.exports = {
  notifyUser,
  notifyAdmins,
  buildScheduledLabel
};
