const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendNotification } = require('../utils/notifications');
const { body, validationResult } = require('express-validator');

// Submit RTI request
router.post('/submit', auth, upload.array('documents', 5), [
  body('subject').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('department').notEmpty(),
  body('questions').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, questions, department, language } = req.body;
    
    // Parse questions if sent as string
    const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions || [];

    // Generate request ID
    const requestId = RTIRequest.generateRequestId();

    // Find department and assign PIO
    const dept = await Department.findOne({ name: department });
    let assignedPIO = null;
    
    if (dept && dept.pios && dept.pios.length > 0) {
      // Round-robin assignment
      const pioIndex = dept.stats.totalRequests % dept.pios.length;
      assignedPIO = dept.pios[pioIndex];
    }

    // Process uploaded documents
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    })) : [];

    // Create RTI request
    const rtiRequest = new RTIRequest({
      requestId,
      citizen: req.userId,
      subject,
      description,
      language: language || req.user.language || 'en',
      questions: parsedQuestions.map(q => ({ question: q })),
      department,
      assignedPIO,
      documents,
      status: 'fee-pending',
      timeline: [{
        status: 'submitted',
        remark: 'RTI application submitted successfully',
        updatedBy: req.userId,
        updatedAt: new Date()
      }]
    });

    await rtiRequest.save();

    // Update department stats
    if (dept) {
      dept.stats.totalRequests += 1;
      dept.stats.pendingRequests += 1;
      await dept.save();
    }

    // Create notification for citizen
    await Notification.create({
      user: req.userId,
      type: 'rti_submitted',
      title: 'RTI Application Submitted',
      message: `Your RTI application ${requestId} has been submitted successfully. Please pay the fee to proceed.`,
      data: {
        requestId,
        request: rtiRequest._id,
        actionUrl: `/track/${requestId}`
      }
    });

    // Send email notification
    await sendNotification(
      req.user.email,
      'RTI Application Submitted',
      `Your RTI application ${requestId} has been submitted. Please pay the fee of ₹10 to process your request.`
    );

    // Notify PIO if assigned
    if (assignedPIO) {
      const pio = await User.findById(assignedPIO);
      if (pio) {
        await Notification.create({
          user: assignedPIO,
          type: 'rti_submitted',
          title: 'New RTI Request Assigned',
          message: `A new RTI request ${requestId} has been assigned to your department.`,
          data: {
            requestId,
            request: rtiRequest._id,
            actionUrl: `/pio-dashboard`
          }
        });

        await sendNotification(
          pio.email,
          'New RTI Request',
          `A new RTI request ${requestId} has been assigned to your department.`
        );
      }
    }

    res.status(201).json({
      message: 'RTI request submitted successfully',
      requestId,
      rtiRequest
    });
  } catch (error) {
    console.error('Submit RTI error:', error);
    res.status(500).json({ message: 'Server error while submitting RTI' });
  }
});

// Pay RTI fee
router.post('/pay-fee/:requestId', auth, async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      citizen: req.userId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'fee-pending') {
      return res.status(400).json({ message: 'Fee already paid or request not in pending state' });
    }

    // Update fee details
    request.feeDetails = {
      amount: 10,
      transactionId,
      paymentMethod,
      paidAt: new Date(),
      status: 'paid'
    };

    request.status = 'fee-paid';
    request.addTimelineEntry('fee-paid', 'Fee payment completed', req.userId);

    // Assign to PIO if not already assigned
    if (!request.assignedPIO) {
      const dept = await Department.findOne({ name: request.department });
      if (dept && dept.pios && dept.pios.length > 0) {
        const pioIndex = dept.stats.totalRequests % dept.pios.length;
        request.assignedPIO = dept.pios[pioIndex];
        
        // Notify PIO
        const pio = await User.findById(request.assignedPIO);
        if (pio) {
          await Notification.create({
            user: request.assignedPIO,
            type: 'rti_status_update',
            title: 'New RTI Request Ready for Review',
            message: `RTI request ${request.requestId} is ready for review after fee payment.`,
            data: {
              requestId: request.requestId,
              request: request._id,
              actionUrl: '/pio-dashboard'
            }
          });
        }
      }
    }

    await request.save();

    // Notify citizen
    await Notification.create({
      user: req.userId,
      type: 'fee_payment',
      title: 'Fee Payment Successful',
      message: `Payment of ₹10 for RTI request ${request.requestId} was successful.`,
      data: {
        requestId: request.requestId,
        request: request._id,
        actionUrl: `/track/${request.requestId}`
      }
    });

    res.json({ 
      message: 'Fee payment successful', 
      request 
    });
  } catch (error) {
    console.error('Pay fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's RTI requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { citizen: req.userId };
    
    if (status) query.status = status;

    const requests = await RTIRequest.find(query)
      .populate('assignedPIO', 'name email')
      .sort({ createdAt: -1 })
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
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single RTI request
router.get('/:requestId', auth, async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ requestId: req.params.requestId })
      .populate('citizen', 'name email phone')
      .populate('assignedPIO', 'name email')
      .populate('appeal.appellateAuthority', 'name email')
      .populate('timeline.updatedBy', 'name role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen' && request.citizen._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this request' });
    }

    if (req.user.role === 'pio' && request.assignedPIO?._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track request status (public)
router.get('/track/:requestId', async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ requestId: req.params.requestId })
      .select('requestId status createdAt deadline response appeal timeline department subject');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Track request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (for PIO/Admin)
router.put('/status/:requestId', auth, async (req, res) => {
  try {
    const { status, remark } = req.body;
    const request = await RTIRequest.findOne({ requestId: req.params.requestId });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role === 'pio' && request.assignedPIO?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = status;
    request.addTimelineEntry(status, remark, req.userId);

    // Update department stats if request is resolved
    if (status === 'replied' || status === 'rejected' || status === 'closed') {
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
    }

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

    const citizen = await User.findById(request.citizen);
    await sendNotification(
      citizen.email,
      'RTI Status Update',
      `Your RTI request ${request.requestId} status has been updated to ${status}.`
    );

    res.json({ message: 'Status updated successfully', request });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback
router.post('/feedback/:requestId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await RTIRequest.findOne({ 
      requestId: req.params.requestId,
      citizen: req.userId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await request.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Download PDF with QR Code
router.get('/download/:requestId', auth, async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ requestId: req.params.requestId })
      .populate('citizen', 'name email phone')
      .populate('assignedPIO', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen' && request.citizen._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Initialize document
    const doc = new PDFDocument({ margin: 50 });
    const filename = `RTI_${request.requestId}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Right to Information (RTI) Application', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Request ID: ${request.requestId}`, { align: 'right' });
    doc.text(`Date Filed: ${new Date(request.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.text(`Status: ${request.status.toUpperCase()}`, { align: 'right' });
    
    // Fetch QR Code from public API
    const trackingUrl = encodeURIComponent(`http://localhost:3000/track/${request.requestId}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${trackingUrl}`;

    const fetchImage = (url) => {
      return new Promise((resolve, reject) => {
        https.get(url, (response) => {
          if (response.statusCode !== 200) return reject(new Error('Failed retrieving QR'));
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
      });
    };

    try {
      const qrBuffer = await fetchImage(qrUrl);
      doc.image(qrBuffer, 50, doc.y, { fit: [100, 100], align: 'left' });
      doc.moveDown(5);
    } catch (e) {
      console.error('QR generation failed silently');
    }

    // Applicant Details
    doc.fontSize(16).text('Applicant Details', { underline: true });
    doc.fontSize(12).text(`Name: ${request.citizen.name}`);
    doc.text(`Email: ${request.citizen.email}`);
    doc.text(`Phone: ${request.citizen.phone}`);
    doc.moveDown();

    // Department Details
    doc.fontSize(16).text('Department Details', { underline: true });
    doc.fontSize(12).text(`Department: ${request.department}`);
    if (request.assignedPIO) {
      doc.text(`Assigned PIO: ${request.assignedPIO.name}`);
    }
    doc.moveDown();

    // Application Subject/Desc
    doc.fontSize(16).text('Application Details', { underline: true });
    doc.fontSize(12).text(`Subject: ${request.subject}`);
    doc.moveDown(0.5);
    doc.text(`Description:`, { underline: true });
    doc.text(request.description);
    doc.moveDown();

    // Questions
    doc.fontSize(14).text('Questions:', { underline: true });
    request.questions.forEach((q, i) => {
      doc.fontSize(12).text(`${i + 1}. ${q.question}`);
      if (q.answer) {
        doc.fontSize(11).text(`Answer: ${q.answer}`, { indent: 20 });
      }
      doc.moveDown(0.5);
    });

    // Response Details
    if (request.response && request.response.text) {
      doc.moveDown();
      doc.fontSize(16).text('Official Response', { underline: true });
      doc.fontSize(12).text(request.response.text);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('This is an automatically generated document from the RTI Connect platform.', { align: 'center', color: 'grey' });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF' });
    }
  }
});

module.exports = router;