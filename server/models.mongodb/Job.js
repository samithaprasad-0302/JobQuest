const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  jobImage: {
    type: mongoose.Schema.Types.Mixed, // Allow both string and object
    default: null
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: false
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'INR'],
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'technology', 'design', 'marketing', 'sales', 'finance', 
      'healthcare', 'education', 'engineering', 'hr', 'operations',
      'customer-service', 'legal', 'consulting', 'research', 'other'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  applicationDeadline: {
    type: Date
  },
  link: {
    type: String,
    trim: true,
    maxlength: 500
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interview', 'rejected', 'accepted'],
      default: 'pending'
    },
    coverLetter: String,
    resume: String
  }],
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ featured: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ company: 1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applicants.length;
});

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
};

// Static method to update expired jobs (call manually when needed)
jobSchema.statics.updateExpiredJobs = async function() {
  return this.updateMany(
    { 
      applicationDeadline: { $lt: new Date() },
      status: { $ne: 'expired' }
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('Job', jobSchema);