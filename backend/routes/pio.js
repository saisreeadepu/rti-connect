const express = require('express');
const router = express.Router();
const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendNotification } = require('../utils/notifications');

// Get PIO's dashboard stats
router.get('/dashboard', auth, authorize('pio'), async (req, res) => {
  try {
    const stats = await RTIRequest.aggregate([
      {
        $match: { assignedPIO: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await RTIRequest.countDocuments({ assignedPIO: req.user._id });
    const pending = await RTIRequest.countDocuments({ 
      assignedPIO: req.user._id,
      status: { $in: ['fee-paid', 'under-review'] }
    });
    const overdue = await RTIRequest.countDocuments({
      assignedPIO: req.user._id,
      deadline: { $lt: new Date() },
      status: { $nin: ['replied', 'rejected', 'closed'] }
    });

    res.json({
      total,
      pending,
      overdue,
      breakdown: stats
    });
  } catch (error) {
    console.error('PIO dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get PIO's assigned requests
router.get('/requests', auth, authorize('pio'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { assignedPIO: req.user._id };
    
    if (status) query.status = status;

    const requests = await RTIRequest.find(query)
      .populate('citizen', 'name email phone')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RTIRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get PIO requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending requests
router.get('/pending', auth, authorize('pio'), async (req, res) => {
  try {
    const requests = await RTIRequest.find({
      assignedPIO: req.user._id,
      status: { $in: ['fee-paid', 'submitted'] }
    })
    .populate('citizen', 'name email phone')
    .sort({ createdAt: 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to RTI request
router.post('/respond/:requestId', auth, authorize('pio'), upload.array('documents', 5), async (req, res) => {
  try {
    const { response } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      assignedPIO: req.user._id
    }).populate('citizen');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Process uploaded documents
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    })) : [];

    // Update request
    request.status = 'replied';
    request.response = {
      text: response,
      documents,
      respondedAt: new Date(),
      respondedBy: req.user._id
    };

    request.addTimelineEntry('replied', 'Response provided', req.user._id);
    await request.save();

    // Update department stats
    const dept = await Department.findOne({ name: request.department });
    if (dept) {
      dept.stats.resolvedRequests += 1;
      dept.stats.pendingRequests -= 1;
      
      // Calculate response time
      const responseTime = Date.now() - request.createdAt;
      const responseTimeDays = responseTime / (1000 * 60 * 60 * 24);
      
      if (responseTimeDays <= 30) {
        dept.stats.onTimeResponses += 1;
      } else {
        dept.stats.delayedResponses += 1;
      }

      dept.stats.averageResponseTime = 
        (dept.stats.averageResponseTime * (dept.stats.resolvedRequests - 1) + responseTimeDays) / 
        dept.stats.resolvedRequests;
      
      await dept.save();
    }

    // Notify citizen
    await Notification.create({
      user: request.citizen._id,
      type: 'rti_response',
      title: 'RTI Response Received',
      message: `Response to your RTI request ${request.requestId} has been uploaded.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: `/track/${request.requestId}`
      }
    });

    await sendNotification(
      request.citizen.email,
      'RTI Response Received',
      `Response to your RTI request ${request.requestId} has been uploaded. Please login to view.`
    );

    res.json({ message: 'Response submitted successfully', request });
  } catch (error) {
    console.error('Respond error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forward request to another department
router.post('/forward/:requestId', auth, authorize('pio'), async (req, res) => {
  try {
    const { department, reason, remarks } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      assignedPIO: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Find target department and PIO
    const targetDept = await Department.findOne({ name: department });
    if (!targetDept || !targetDept.pios || targetDept.pios.length === 0) {
      return res.status(400).json({ message: 'No PIO available in target department' });
    }

    // Update request
    request.forwardedTo.push({
      department: request.department,
      pio: request.assignedPIO,
      forwardedAt: new Date(),
      reason,
      remarks
    });

    request.department = department;
    request.assignedPIO = targetDept.pios[0];
    request.status = 'forwarded';
    request.addTimelineEntry('forwarded', `Forwarded to ${department}: ${reason}`, req.user._id);

    await request.save();

    // Notify new PIO
    const newPIO = await User.findById(targetDept.pios[0]);
    await Notification.create({
      user: targetDept.pios[0],
      type: 'rti_status_update',
      title: 'RTI Request Forwarded',
      message: `An RTI request ${request.requestId} has been forwarded to your department.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: '/pio-dashboard'
      }
    });

    await sendNotification(
      newPIO.email,
      'RTI Request Forwarded',
      `An RTI request ${request.requestId} has been forwarded to your department.`
    );

    res.json({ message: 'Request forwarded successfully', request });
  } catch (error) {
    console.error('Forward error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get request details
router.get('/request/:requestId', auth, authorize('pio'), async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      assignedPIO: req.user._id
    }).populate('citizen', 'name email phone address');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.put('/status/:requestId', auth, authorize('pio'), async (req, res) => {
  try {
    const { status, remark } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      assignedPIO: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    request.addTimelineEntry(status, remark, req.user._id);
    await request.save();

    // Notify citizen
    await Notification.create({
      user: request.citizen,
      type: 'rti_status_update',
      title: 'RTI Status Updated',
      message: `Your RTI request ${request.requestId} status has been updated to ${status}.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: `/track/${request.requestId}`
      }
    });

    res.json({ message: 'Status updated successfully', request });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;