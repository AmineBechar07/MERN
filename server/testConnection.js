const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('Connection string from .env:', process.env.MONGODB_URI);

// Set up mongoose debug and events
mongoose.set('debug', true);
mongoose.connection.on('connecting', () => console.log('Mongoose connecting...'));
mongoose.connection.on('connected', () => console.log('Mongoose connected!'));
mongoose.connection.on('error', (err) => console.log('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

// Connection options
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
};

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Connection successful!');
    console.log('Mongoose readyState:', mongoose.connection.readyState);
    
    // Test a simple query
    const count = await mongoose.connection.db.admin().ping();
    console.log('Ping response:', count);
    
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
