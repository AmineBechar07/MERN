const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const logStream = fs.createWriteStream('connection_test.log');
const originalConsoleLog = console.log;

console.log = function(message) {
  originalConsoleLog(message);
  logStream.write(message + '\n');
};

async function testConnection() {
  try {
    console.log('\n=== Starting MongoDB Connection Test ===');
    console.log(`Connection String: ${process.env.MONGODB_URI}`);
    
    // Test basic connectivity
    console.log('\n[1/3] Testing network connectivity...');
    const { exec } = require('child_process');
    exec('ping -n 4 cluster0.hcdjf.mongodb.net', (error, stdout) => {
      console.log(stdout);
      
      // Test MongoDB connection
      console.log('\n[2/3] Testing MongoDB connection...');
      mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      })
      .then(() => {
        console.log('Successfully connected to MongoDB!');
        console.log('Connection readyState:', mongoose.connection.readyState);
        
        // Test basic query
        console.log('\n[3/3] Testing database query...');
        return mongoose.connection.db.admin().ping();
      })
      .then(result => {
        console.log('Database ping successful:', result);
        process.exit(0);
      })
      .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
      });
    });
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testConnection();
