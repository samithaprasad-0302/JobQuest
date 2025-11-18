const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // User who applied
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Job information
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Application details
  appliedAt: {
    type: Date,
    default: Date.now
  },
  applicationMethod: {
    type: String,
    enum: ['gmail', 'outlook', 'email_client', 'external'],
    required: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['applied', 'under_review', 'interview_scheduled', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Contact email used for application
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Tracking information
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Optional: Store the email subject and body for reference
  emailSubject: {
    type: String,
    trim: true
  },
  emailBody: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ userId: 1, appliedAt: -1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });

// Prevent duplicate applications for the same job by the same user
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Virtual for getting application age
applicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const diffInMs = now.getTime() - this.appliedAt.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return '1 day ago';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
});

// Method to update application status
applicationSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  this.lastUpdated = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Static method to get user's application statistics
applicationSchema.statics.getUserStats = async function(userId) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  const result = {
    total: 0,
    applied: 0,
    under_review: 0,
    interview_scheduled: 0,
    offered: 0,
    rejected: 0,
    withdrawn: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Application', applicationSchema);