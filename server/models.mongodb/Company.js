const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 2000,
    default: 'No description available'
  },
  industry: {
    type: String,
    trim: true,
    default: 'Technology'
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  location: {
    headquarters: {
      type: String,
      trim: true,
      default: 'Not specified'
    },
    offices: [{
      city: String,
      country: String,
      address: String
    }]
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
    default: '11-50'
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  benefits: [{
    type: String,
    trim: true
  }],
  culture: {
    type: String,
    maxlength: 1000
  },
  values: [{
    type: String,
    trim: true
  }],
  rating: {
    overall: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    workLifeBalance: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    compensation: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    culture: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    management: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ size: 1 });
companySchema.index({ featured: 1 });
companySchema.index({ verified: 1 });

// Virtual for job count
companySchema.virtual('jobCount').get(function() {
  return this.jobs.length;
});

// Virtual for follower count
companySchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

module.exports = mongoose.model('Company', companySchema);