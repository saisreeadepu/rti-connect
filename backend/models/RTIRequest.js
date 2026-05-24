const mongoose = require('mongoose');

const rtiRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  language: {
    type: String,
    enum: ['en', 'te', 'hi'],
    default: 'en'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: String,
    answeredAt: Date,
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  department: {
    type: String,
    required: true
  },
  assignedPIO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: [
      'submitted', 
      'fee-pending', 
      'fee-paid', 
      'under-review', 
      'forwarded', 
      'replied', 
      'rejected',
      'appealed',
      'closed'
    ],
    default: 'submitted'
  },
  feeDetails: {
    amount: {
      type: Number,
      default: 10
    },
    transactionId: String,
    paymentMethod: String,
    paidAt: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    }
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    text: String,
    documents: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String
    }],
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  appeal: {
    filed: {
      type: Boolean,
      default: false
    },
    reason: String,
    appellateAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decision: {
      type: String,
      enum: ['pending', 'accepted', 'rejected']
    },
    decisionRemarks: String,
    filedAt: Date,
    decidedAt: Date
  },
  timeline: [{
    status: String,
    remark: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    default: function() {
      // 30 days from submission
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  forwardedTo: [{
    department: String,
    pio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    forwardedAt: Date,
    reason: String,
    remarks: String
  }],
  feedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  }
});

// Add timeline entry
rtiRequestSchema.methods.addTimelineEntry = function(status, remark, userId) {
  this.timeline.push({
    status,
    remark,
    updatedBy: userId,
    updatedAt: new Date()
  });
};

// Generate unique request ID
rtiRequestSchema.statics.generateRequestId = function() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `RTI${timestamp}${random}`;
};

module.exports = mongoose.model('RTIRequest', rtiRequestSchema);