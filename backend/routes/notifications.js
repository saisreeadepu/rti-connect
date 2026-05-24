const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { user: req.userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.userId);

    res.json({
      notifications,
      unreadCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all notifications
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationPreferences');
    res.json(user.notificationPreferences || {
      email: true,
      sms: false,
      types: {
        rti_submitted: true,
        rti_status_update: true,
        rti_response: true,
        appeal_filed: true,
        appeal_decision: true,
        fee_payment: true,
        deadline_reminder: true
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { email, sms, types } = req.body;
    const user = await User.findById(req.userId);

    user.notificationPreferences = {
      email: email !== undefined ? email : true,
      sms: sms !== undefined ? sms : false,
      types: types || {
        rti_submitted: true,
        rti_status_update: true,
        rti_response: true,
        appeal_filed: true,
        appeal_decision: true,
        fee_payment: true,
        deadline_reminder: true
      }
    };

    await user.save();
    res.json({ message: 'Preferences updated', preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test notification
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    await sendNotification(
      user.email,
      'Test Notification',
      'This is a test notification from RTI Connect.'
    );

    await Notification.create({
      user: req.userId,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification from RTI Connect.'
    });

    res.json({ message: 'Test notification sent' });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;