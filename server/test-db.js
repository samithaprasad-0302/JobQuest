const mongoose = require('mongoose');
require('dotenv').config();

// Simple MongoDB connection test
const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobquest', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Connection details:');
    console.log(`   - State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`   - Database: ${mongoose.connection.name}`);
    console.log(`   - Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   - Collections: ${collections.length} found`);
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    process.exit(1);
  }
};

testConnection();