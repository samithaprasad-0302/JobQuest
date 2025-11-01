const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const adminRoutes = require('./routes/admin');
const guestApplicationRoutes = require('./routes/guestApplications');
const applicationRoutes = require('./routes/applications');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5000", "http://localhost:5173"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with CORS headers
app.use('/api/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with retry logic
const connectToDatabase = async (retryCount = 0) => {
  const maxRetries = 5;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobquest', {
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      
      // Timeout settings
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 30000, // 30 seconds to establish initial connection
      
      // Heartbeat and monitoring
      heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Additional stability options
      retryWrites: true, // Enable retryable writes
      w: 'majority', // Write concern
      retryReads: true, // Enable retryable reads
      
      // Family setting for IPv4
      family: 4,
    });
    console.log('✅ Connected to MongoDB');
    return;
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
    
    if (retryCount < maxRetries - 1) {
      console.log(`⏳ Retrying connection in 5 seconds...`);
      setTimeout(() => connectToDatabase(retryCount + 1), 5000);
    } else {
      console.error('❌ Failed to connect to MongoDB after maximum retries');
      process.exit(1);
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
  console.log('🔄 Attempting to reconnect in 5 seconds...');
  // Only reconnect if not intentionally disconnecting
  if (mongoose.connection.readyState === 0) {
    setTimeout(() => {
      console.log('🔄 Initiating reconnection...');
      connectToDatabase();
    }, 5000);
  }
});

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  // If connection is lost, try to reconnect
  if (mongoose.connection.readyState === 0) {
    console.log('🔄 Connection lost, attempting to reconnect...');
    setTimeout(() => connectToDatabase(), 5000);
  }
});

// Monitor connection state changes
mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Reconnected to MongoDB');
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('📝 Received SIGINT, gracefully shutting down...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('📝 Received SIGTERM, gracefully shutting down...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize database connection
connectToDatabase();

// Database health monitoring
setInterval(async () => {
  try {
    // Check connection state
    const state = mongoose.connection.readyState;
    
    if (state !== 1) { // 1 = connected
      console.log(`🔍 Database connection check - State: ${getConnectionState(state)}`);
      
      if (state === 0) { // 0 = disconnected
        console.log('🔄 Database disconnected, attempting to reconnect...');
        await connectToDatabase();
      }
    } else {
      // Ping database to ensure it's responding
      await mongoose.connection.db.admin().ping();
      console.log('💚 Database health check passed');
    }
  } catch (error) {
    console.error('❌ Database health check error:', error.message);
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Health check failed, attempting to reconnect...');
      await connectToDatabase();
    }
  }
}, 60000); // Check every 60 seconds

// Helper function to get readable connection state
const getConnectionState = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
};

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    console.log('⚠️  Database not connected, attempting to reconnect...');
    connectToDatabase();
    res.status(503).json({ 
      message: 'Database temporarily unavailable. Please try again.',
      status: 'DB_DISCONNECTED'
    });
  }
};

// Apply database check middleware to API routes
app.use('/api', checkDbConnection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guest-applications', guestApplicationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});