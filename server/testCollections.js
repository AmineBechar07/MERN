const mongoose = require('mongoose');
require('dotenv').config();

async function testCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    const breastCancerCollections = collections
      .map(c => c.name)
      .filter(n => n.includes('stage'));
    
    console.log('Breast Cancer Collections:', breastCancerCollections);
    
    if (breastCancerCollections.length > 0) {
      console.log('\nSample documents:');
      for (const collName of breastCancerCollections) {
        const sample = await db.collection(collName).findOne();
        console.log(`\nCollection: ${collName}`);
        console.log(sample || 'No documents found');
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

testCollections();
