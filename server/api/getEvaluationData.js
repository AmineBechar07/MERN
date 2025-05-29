const mongoose = require('mongoose');

async function getFirstDocuments() {
  try {
    const db = mongoose.connection.db;
    const collections = [
      'non-invasive-stage-mistral',
      'non-invasive-stage-deepseek-new',
      'advanced-stage-deepseek',
      'advanced-stage-biomistral'
    ];

    const results = {};
    for (const collection of collections) {
      const doc = await db.collection(collection).findOne({});
      results[collection] = doc || {};
    }
    return results;
  } catch (error) {
    console.error('Error fetching first documents:', error);
    return {};
  }
}

async function getEvaluationData(page, type) {
  console.log('\n--- CRITICAL PATH START ---');
  console.log('Function called with:', { page, type });
  console.log('Mongoose connection state:', mongoose.connection.readyState);
  console.log('Parameters:', { page, type });
  console.log('MONGO_URI:', process.env.MONGO_URI);
  try {
    const db = mongoose.connection.db;
    console.log('Database collections:', await db.listCollections().toArray());
    
    // Define collection mappings based on type
    const collectionMappings = {
      'non-invasive': {
        mistral: 'non-invasive-stage-mistral',
        deepseek: 'non-invasive-stage-deepseek-new'
      },
      'advanced': {
        mistral: 'advanced-stage-biomistral', 
        deepseek: 'advanced-stage-deepseek'
      }
    };

    // Get collections for the specified type
    const collections = collectionMappings[type];
    if (!collections) {
      return { mistral: {}, deepseek: {}, totalPages: 0 };
    }

    // Get total count from deepseek collection for pagination
    const totalCount = await db.collection(collections.deepseek).countDocuments();
    console.log(totalCount)
    console.log("11111111111111111aw")
    // Pagination parameters
    const perPage = 1;
    const skip = (page - 1) * perPage;

    // Fetch data from both collections with pagination
    const [mistralData, deepseekData] = await Promise.all([
      db.collection(collections.mistral)
        .find({})
        .skip(skip)
        .limit(perPage)
        .toArray()
        .then(docs => docs[0] || {}),
      db.collection(collections.deepseek)
        .find({})
        .skip(skip)
        .limit(perPage)
        .toArray()
        .then(docs => docs[0] || {})
    ]);

    // Add detailed etiquette and explanation fields based on source and type
    const processedMistralData = mistralData ? {
      ...mistralData,
      etiquette: type === 'advanced' 
        ? 'Advanced Breast Cancer Analysis by Mistral' 
        : 'Non-Invasive Breast Cancer Analysis by Mistral',
      explinationetiqette: type === 'advanced'
        ? 'Mistral analyzed this advanced stage case focusing on metastasis patterns and treatment resistance factors.'
        : 'Mistral evaluated this non-invasive case with emphasis on ductal architecture and progression risk factors.'
    } : {};

    const processedDeepseekData = deepseekData ? {
      ...deepseekData,
      etiquette: type === 'advanced'
        ? 'Advanced Breast Cancer Analysis by DeepSeek'
        : 'Non-Invasive Breast Cancer Analysis by DeepSeek',
      explinationetiqette: type === 'advanced'
        ? 'DeepSeek processed this advanced case with special attention to genomic markers and therapeutic response.'
        : 'DeepSeek assessed this non-invasive case focusing on cellular differentiation and recurrence probabilities.'
    } : {};

    // Calculate total pages based on perPage (1 document per page)
    const result = {
      mistral: processedMistralData,
      deepseek: processedDeepseekData,
      totalPages: Math.ceil(totalCount / 1) // 1 document per page
    };
    console.log('API Result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching evaluation data:', error);
    return { mistral: {}, deepseek: {}, totalPages: 0 };
  }
}

async function getCollectionCounts() {
  try {
    console.log('Starting getCollectionCounts...');
    const db = mongoose.connection.db;
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    
    const collections = [
      'non-invasive-stage-mistral',
      'non-invasive-stage-deepseek-new', 
      'advanced-stage-deepseek',
      'advanced-stage-biomistral'
    ];
    console.log('Collections to count:', collections);

    const counts = {};
    for (const collection of collections) {
      console.log(`Counting documents in ${collection}...`);
      counts[collection] = await db.collection(collection).countDocuments();
      console.log(`Count for ${collection}:`, counts[collection]);
    }
    
    console.log('Final counts:', counts);
    return counts;
  } catch (error) {
    console.error('Error counting documents:', error);
    console.error('Error stack:', error.stack);
    return {};
  }
}

async function getDetailedReport(type, page = 1) {
  try {
    const db = mongoose.connection.db;
    const perPage = 1; // Consistent with getEvaluationData
    const skip = (page - 1) * perPage;

    // Define collections based on type
    const collections = {
      mistral: type === 'advanced' 
        ? 'advanced-stage-biomistral' 
        : 'non-invasive-stage-mistral',
      deepseek: type === 'advanced'
        ? 'advanced-stage-deepseek'
        : 'non-invasive-stage-deepseek-new'
    };

    // Get and log document counts for debugging
    const deepseekCount = await db.collection(collections.deepseek).countDocuments();
    const mistralCount = await db.collection(collections.mistral).countDocuments();
    console.log(`Document counts - Deepseek: ${deepseekCount}, Mistral: ${mistralCount}`);

    // Use the larger count for pagination
    const totalCount = Math.max(deepseekCount, mistralCount);
    const totalPages = Math.ceil(totalCount / perPage);
    console.log(`Pagination - Total: ${totalCount}, PerPage: ${perPage}, Pages: ${totalPages}`);

    // Verify we have documents to fetch
    if (totalCount === 0) {
      console.log('No documents found in collections');
      return { documents: [], totalPages: 0, currentPage: 1 };
    }

    // Fetch documents with pagination
    const [mistralDocs, deepseekDocs] = await Promise.all([
      db.collection(collections.mistral)
        .find({})
        .skip(skip)
        .limit(perPage)
        .toArray(),
      db.collection(collections.deepseek)
        .find({})
        .skip(skip)
        .limit(perPage)
        .toArray()
    ]);

    // Combine documents with additional fields
    const results = deepseekDocs.map((deepseekDoc, index) => {
      const mistralDoc = mistralDocs[index] || {};
      return {
        // Deepseek fields
        ...Object.fromEntries(
          Object.entries(deepseekDoc)
            .filter(([key]) => !['etiquette', 'Étiquette', 'explinationetiqette', 'Explication de l\'Étiquette'].includes(key))
        ),
        'Étiquette': deepseekDoc.etiquette || deepseekDoc['Étiquette'] || '',
        'Explication de l\'Étiquette': deepseekDoc.explinationetiqette || deepseekDoc['Explication de l\'Étiquette'] || '',
        
        // Mistral fields (prefixed with Bio)
        'Bio Étiquette': mistralDoc.etiquette || mistralDoc['Étiquette'] || '',
        'Bio Explication de l\'Étiquette': mistralDoc.explinationetiqette || mistralDoc['Explication de l\'Étiquette'] || '',
        ...Object.fromEntries(
          Object.entries(mistralDoc)
            .filter(([key]) => !['etiquette', 'Étiquette', 'explinationetiqette', 'Explication de l\'Étiquette'].includes(key))
        )
      };
    });

    return {
      documents: results,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: page
    };
  } catch (err) {
    console.error('Error in getDetailedReport:', err);
    return { documents: [], totalPages: 0, currentPage: 1 };
  }
}

async function isPageEvaluated(page, type) {
  try {
    const Evaluation = require('../models/Evaluation');
    
    // Count evaluations for this page and type
    const count = await Evaluation.countDocuments({
      id_report: page,
      type_of_report: type
    });

    // Page is complete if we have at least 2 evaluations (one for each model)
    return count >= 2;
  } catch (error) {
    console.error('Error checking page evaluations:', error);
    return false;
  }
}

module.exports = {
  getEvaluationData,
  getFirstDocuments,
  getCollectionCounts,
  getDetailedReport,
  isPageEvaluated
};
