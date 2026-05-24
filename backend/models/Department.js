const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  keywords: [String],
  language: {
    type: String,
    enum: ['en', 'te', 'hi'],
    default: 'en'
  },
  pios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  appellateAuthority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    pendingRequests: {
      type: Number,
      default: 0
    },
    resolvedRequests: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    onTimeResponses: {
      type: Number,
      default: 0
    },
    delayedResponses: {
      type: Number,
      default: 0
    }
  },
  contactInfo: {
    address: String,
    phone: String,
    email: String,
    officeHours: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update stats method
departmentSchema.methods.updateStats = async function() {
  const RTIRequest = mongoose.model('RTIRequest');
  
  const total = await RTIRequest.countDocuments({ department: this.name });
  const pending = await RTIRequest.countDocuments({ 
    department: this.name,
    status: { $in: ['submitted', 'under-review', 'forwarded'] }
  });
  const resolved = await RTIRequest.countDocuments({ 
    department: this.name,
    status: { $in: ['replied', 'rejected', 'closed'] }
  });

  this.stats.totalRequests = total;
  this.stats.pendingRequests = pending;
  this.stats.resolvedRequests = resolved;
  
  await this.save();
};

module.exports = mongoose.model('Department', departmentSchema);