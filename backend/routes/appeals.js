const express = require('express');
const router = express.Router();
const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

// File first appeal
router.post('/file/:requestId', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      citizen: req.userId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'replied' && request.status !== 'rejected') {
      return res.status(400).json({ 
        message: 'Cannot appeal at current status. Appeals can only be filed after receiving a response.' 
      });
    }

    if (request.appeal && request.appeal.filed) {
      return res.status(400).json({ message: 'Appeal already filed for this request' });
    }

    // Find appellate authority for department
    const dept = await Department.findOne({ name: request.department });
    if (!dept || !dept.appellateAuthority) {
      return res.status(400).json({ message: 'No appellate authority available for this department' });
    }

    // File appeal
    request.status = 'appealed';
    request.appeal = {
      filed: true,
      reason,
      appellateAuthority: dept.appellateAuthority,
      filedAt: new Date(),
      decision: 'pending'
    };

    request.addTimelineEntry('appealed', `Appeal filed: ${reason}`, req.userId);
    await request.save();

    // Notify appellate authority
    const appellate = await User.findById(dept.appellateAuthority);
    await Notification.create({
      user: dept.appellateAuthority,
      type: 'appeal_filed',
      title: 'New Appeal Filed',
      message: `An appeal has been filed for RTI request ${request.requestId}.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: '/appeal-dashboard'
      }
    });

    await sendNotification(
      appellate.email,
      'New Appeal Filed',
      `An appeal has been filed for RTI request ${request.requestId}. Please review.`
    );

    // Notify citizen
    await Notification.create({
      user: req.userId,
      type: 'appeal_filed',
      title: 'Appeal Filed Successfully',
      message: `Your appeal for RTI request ${request.requestId} has been filed.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: `/track/${request.requestId}`
      }
    });

    res.json({ message: 'Appeal filed successfully', request });
  } catch (error) {
    console.error('File appeal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appeals for appellate authority
router.get('/pending', auth, authorize('appellate'), async (req, res) => {
  try {
    const requests = await RTIRequest.find({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': 'pending'
    })
    .populate('citizen', 'name email phone')
    .populate('assignedPIO', 'name email')
    .sort({ 'appeal.filedAt': 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get pending appeals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get decided appeals
router.get('/decided', auth, authorize('appellate'), async (req, res) => {
  try {
    const requests = await RTIRequest.find({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': { $ne: 'pending' }
    })
    .populate('citizen', 'name email')
    .sort({ 'appeal.decidedAt': -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get decided appeals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appeal details
router.get('/:requestId', auth, authorize('appellate'), async (req, res) => {
  try {
    const request = await RTIRequest.findOne({
      requestId: req.params.requestId,
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId
    })
    .populate('citizen', 'name email phone address')
    .populate('assignedPIO', 'name email')
    .populate('response.respondedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get appeal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decide on appeal
router.post('/decide/:requestId', auth, authorize('appellate'), async (req, res) => {
  try {
    const { decision, remarks } = req.body;
    const request = await RTIRequest.findOne({
      requestId: req.params.requestId,
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId
    }).populate('citizen');

    if (!request) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    if (request.appeal.decision !== 'pending') {
      return res.status(400).json({ message: 'Appeal already decided' });
    }

    // Update appeal decision
    request.appeal.decision = decision;
    request.appeal.decisionRemarks = remarks;
    request.appeal.decidedAt = new Date();
    
    if (decision === 'accepted') {
      // If appeal accepted, assign back to PIO for reconsideration
      const dept = await Department.findOne({ name: request.department });
      if (dept && dept.pios && dept.pios.length > 0) {
        // Assign to a different PIO if possible
        const currentPIOIndex = dept.pios.findIndex(p => p.toString() === request.assignedPIO?.toString());
        const newPIOIndex = (currentPIOIndex + 1) % dept.pios.length;
        request.assignedPIO = dept.pios[newPIOIndex];
        request.status = 'under-review';
      } else {
        request.status = 'under-review';
      }
      
      request.addTimelineEntry('appeal-accepted', `Appeal accepted: ${remarks}`, req.userId);
    } else {
      request.status = 'closed';
      request.addTimelineEntry('appeal-rejected', `Appeal rejected: ${remarks}`, req.userId);
    }

    await request.save();

    // Notify citizen
    await Notification.create({
      user: request.citizen._id,
      type: 'appeal_decision',
      title: 'Appeal Decision',
      message: `Your appeal for RTI request ${request.requestId} has been ${decision}.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: `/track/${request.requestId}`
      }
    });

    await sendNotification(
      request.citizen.email,
      'Appeal Decision',
      `Your appeal for RTI request ${request.requestId} has been ${decision}. ${remarks ? 'Remarks: ' + remarks : ''}`
    );

    // Notify PIO if reassigned
    if (decision === 'accepted' && request.assignedPIO) {
      const newPIO = await User.findById(request.assignedPIO);
      await Notification.create({
        user: request.assignedPIO,
        type: 'appeal_decision',
        title: 'Appeal Accepted - Request Reassigned',
        message: `An appeal for RTI request ${request.requestId} was accepted. The request has been reassigned to you.`,
        data: {
          requestId: request.requestId,
          request: request._id,
          actionUrl: '/pio-dashboard'
        }
      });
    }

    res.json({ message: 'Appeal decision recorded', request });
  } catch (error) {
    console.error('Decide appeal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appellate authority dashboard stats
router.get('/dashboard/stats', auth, authorize('appellate'), async (req, res) => {
  try {
    const pending = await RTIRequest.countDocuments({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': 'pending'
    });

    const decided = await RTIRequest.countDocuments({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': { $ne: 'pending' }
    });

    const accepted = await RTIRequest.countDocuments({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': 'accepted'
    });

    const rejected = await RTIRequest.countDocuments({
      'appeal.filed': true,
      'appeal.appellateAuthority': req.userId,
      'appeal.decision': 'rejected'
    });

    res.json({
      pending,
      decided,
      accepted,
      rejected,
      total: pending + decided
    });
  } catch (error) {
    console.error('Appeal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;