const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const NonInvasiveStage = require('./models/NonInvasiveStage');
const InvasiveStageDeepseek = require('./models/InvasiveStageDeepseek');
const InvasiveStageBiomistral = require('./models/InvasiveStageBiomistral');
const Evaluation = require('./models/Evaluation'); // Added Evaluation model
require('dotenv').config();
const path = require('path'); // Import path module

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('MongoDB host:', mongoose.connection.host);
    console.log('MongoDB database:', mongoose.connection.name);
    console.log('MongoDB collections:', await mongoose.connection.db.listCollections().toArray());
    
    // Create test users if they don't exist
    try {
    const testUsers = [
      { username: 'RISE2025', password: 'RISE2025' },
      { username: 'RISE2026', password: '0000' }
    ];
    
    // Clear existing test users first
    await User.deleteMany({ 
      username: { $in: testUsers.map(u => u.username) } 
    });

      for (const user of testUsers) {
        const existingUser = await User.findOne({ username: user.username });
        if (!existingUser) {
          console.log(`Creating test user ${user.username}...`);
          const newUser = await User.create(user);
          console.log('Test user created:', {
            username: newUser.username,
            password: newUser.password
          });
        } else {
          console.log('Test user already exists:', {
            username: existingUser.username,
            password: existingUser.password
          });
        }
      }
    } catch (err) {
      console.error('Error creating test users:', err);
    }
  })
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  // This route will now be handled by serving index.html for the React app
  // res.send('API is running');
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to save or update an evaluation
app.post('/api/evaluations/save', async (req, res) => {
  try {
    const {
      id_report,
      model_name,
      type_of_report,
      criteria_1_rating,
      criteria_2_rating,
      criteria_3_rating,
      userId // Optional: pass userId if evaluations are user-specific
    } = req.body;

    if (id_report === undefined || !model_name || !type_of_report) {
      return res.status(400).json({ message: 'Missing required fields: id_report, model_name, type_of_report' });
    }

    const query = {
      id_report,
      model_name,
      type_of_report,
    };
    // Add userId to query if it's provided and you want evaluations to be user-specific
    // For now, assuming evaluations can be anonymous or you'll handle userId association differently
    // if (userId) {
    //   query.userId = userId;
    // }

    const update = {
      criteria_1_rating: criteria_1_rating !== undefined ? Number(criteria_1_rating) : 0,
      criteria_2_rating: criteria_2_rating !== undefined ? Number(criteria_2_rating) : 0,
      criteria_3_rating: criteria_3_rating !== undefined ? Number(criteria_3_rating) : 0,
      // userId: userId // Set userId if provided
    };

    // The 'pre' save hook in Evaluation.js will calculate 'all_criteria_met'
    const options = {
      new: true, // Return the modified document rather than the original
      upsert: true, // Create a new document if no documents match the filter
      setDefaultsOnInsert: true // Apply schema defaults when a new document is created
    };

    const savedEvaluation = await Evaluation.findOneAndUpdate(query, update, options);

    res.status(200).json({ message: 'Evaluation saved successfully', data: savedEvaluation });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    // Check for unique constraint violation (MongoDB error code 11000)
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Duplicate evaluation entry. This page for this model and report type might already be saved.', error: error.message });
    }
    res.status(500).json({ message: 'Server error while saving evaluation', error: error.message });
  }
});

// Evaluation data endpoints
const getEvaluationData = require('./api/getEvaluationData');
const checkEvaluationStatusRouter = require('./api/checkEvaluationStatus'); // Import the new router
const getPageEvaluationsRouter = require('./api/getPageEvaluations'); // Import router for fetching page evaluations
const getEvaluationTypeCompletionStatusRouter = require('./api/getEvaluationTypeCompletionStatus'); // Import router for type completion status

// New detailed report endpoint
app.get('/api/evaluation/detailed-report', async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    if (!type || !['advanced', 'non-invasive', 'invasive'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const data = await getEvaluationData.getDetailedReport(type, parseInt(page));
    res.json(data);
  } catch (err) {
    console.error('Error in detailed report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/evaluation/first-documents', async (req, res) => {
  try {
    const data = await getEvaluationData.getFirstDocuments();
    res.json(data);
  } catch (err) {
    console.error('Error fetching first documents:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

  app.get('/api/evaluation/is-page-complete', async (req, res) => {
    try {
      const { page, type } = req.query;
      const isComplete = await isPageEvaluated(parseInt(page), type);
      res.json({ isComplete });
    } catch (error) {
      console.error('Error checking page completion:', error);
      res.status(500).json({ error: 'Failed to check page completion' });
    }
  });

  app.get('/api/evaluation/collection-counts', async (req, res) => {
  try {
    const counts = await getEvaluationData.getCollectionCounts();
    res.json(counts);
  } catch (err) {
    console.error('Error fetching collection counts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for checking evaluation status
app.use('/api/check-evaluation-status', checkEvaluationStatusRouter);

// Route for fetching existing evaluations for a page
app.use('/api/get-page-evaluations', getPageEvaluationsRouter);

// Route for checking evaluation type completion status
app.use('/api/evaluation-type-completion-status', getEvaluationTypeCompletionStatusRouter);

app.get('/api/evaluation', async (req, res) => {
  try {
    const { page, type } = req.query;
    const data = await getEvaluationData(parseInt(page) || 1, type);
    res.json(data);
  } catch (err) {
    console.error('Error fetching evaluation data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get non-invasive stage data
app.get('/api/non-invasive-stage-mistral', async (req, res) => {
  try {
    const data = await NonInvasiveStage.find();
    res.json(data);
  } catch (err) {
    console.error('Error fetching non-invasive stage data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invasive stage deepseek data
app.get('/api/invasive-stage-deepseek', async (req, res) => {
  try {
    const data = await InvasiveStageDeepseek.find();
    res.json(data);
  } catch (err) {
    console.error('Error fetching invasive stage deepseek data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invasive stage biomistral data
app.get('/api/invasive-stage-biomistral', async (req, res) => {
  try {
    const data = await InvasiveStageBiomistral.find();
    res.json(data);
  } catch (err) {
    console.error('Error fetching invasive stage biomistral data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to list collections
app.get('/api/test-collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections);
    res.json(collections.map(c => c.name));
  } catch (err) {
    console.error('Error listing collections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
