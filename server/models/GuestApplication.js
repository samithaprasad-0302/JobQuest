const mongoose = require('mongoose');

const guestApplicationSchema = new mongoose.Schema({
  // Guest applicant information
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
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
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'rejected', 'accepted'],
    default: 'pending'
  },
  
  // Tracking information
  appliedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
guestApplicationSchema.index({ email: 1 });
guestApplicationSchema.index({ jobId: 1 });
guestApplicationSchema.index({ appliedAt: -1 });
guestApplicationSchema.index({ status: 1 });

// Virtual for full name
guestApplicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static method to get applications by job
guestApplicationSchema.statics.getByJob = function(jobId) {
  return this.find({ jobId }).populate('jobId').sort({ appliedAt: -1 });
};

// Static method to get applications by email
guestApplicationSchema.statics.getByEmail = function(email) {
  return this.find({ email: email.toLowerCase() }).populate('jobId').sort({ appliedAt: -1 });
};

// Instance method to mark as reviewed
guestApplicationSchema.methods.markAsReviewed = function(reviewerId, status, notes) {
  this.status = status || 'reviewed';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) this.adminNotes = notes;
  return this.save();
};

const GuestApplication = mongoose.model('GuestApplication', guestApplicationSchema);

module.exports = GuestApplication;