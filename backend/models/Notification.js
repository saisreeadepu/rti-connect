const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'rti_submitted',
      'rti_status_update',
      'rti_response',
      'appeal_filed',
      'appeal_decision',
      'fee_payment',
      'deadline_reminder',
      'system_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    requestId: String,
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RTIRequest'
    },
    actionUrl: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  isSMSSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date
});

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);