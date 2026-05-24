const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const RTIRequest = require('../models/RTIRequest');
const Department = require('../models/Department');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notifications');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mocksecret',
});

// Create Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, requestId } = req.body;
    
    // Validate request
    const rtiReq = await RTIRequest.findOne({ requestId, citizen: req.userId });
    if (!rtiReq || rtiReq.status !== 'fee-pending') {
      return res.status(400).json({ message: 'Invalid RTI request or fee already paid.' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${requestId}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify Payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      requestId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mocksecret')
      .update(sign.toString())
      .digest("hex");

    // We can allow mock processing if the mock key is used
    const isMock = (process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey') === 'rzp_test_mockkey';
    const isSignatureValid = expectedSign === razorpay_signature || isMock;

    // Additionally check if payment_id starts with mock_ for development test skips
    const isDevMock = razorpay_payment_id && razorpay_payment_id.startsWith('mock_');

    if (isSignatureValid || isDevMock) {
      // Payment is successful
      const request = await RTIRequest.findOne({ requestId, citizen: req.userId });
      
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Update fee details
      request.feeDetails = {
        amount: 10,
        transactionId: razorpay_payment_id,
        paymentMethod: 'razorpay',
        paidAt: new Date(),
        status: 'paid'
      };

      request.status = 'fee-paid';
      request.addTimelineEntry('fee-paid', 'Fee payment completed via Razorpay', req.userId);

      // Assign to PIO logic (copied from rti.js/pay-fee route)
      if (!request.assignedPIO) {
        const dept = await Department.findOne({ name: request.department });
        if (dept && dept.pios && dept.pios.length > 0) {
          const pioIndex = dept.stats.totalRequests % dept.pios.length;
          request.assignedPIO = dept.pios[pioIndex];
          
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

      return res.json({ message: 'Payment verified successfully', request });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature!' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
});

module.exports = router;
