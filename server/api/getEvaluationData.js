const mongoose = require('mongoose');

async function getFirstDocuments() {
  try {
    const db = mongoose.connection.db;
    const collections = [
      'non-invasive-stage-mistral',
      'non-invasive-stage-deepseek-new',
      'advanced-stage-deepseek',
      'advanced-stage-biomistral',
      'invasive-stage-deepseek',
      'invasive-stage-biomistral'
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

async function getCollectionCounts() {
  try {
    const db = mongoose.connection.db;
    const collections = [
      'non-invasive-stage-mistral',
      'non-invasive-stage-deepseek-new', 
      'advanced-stage-deepseek',
      'advanced-stage-biomistral',
      'invasive-stage-deepseek',
      'invasive-stage-biomistral'
    ];

    const counts = {};
    for (const collection of collections) {
      counts[collection] = await db.collection(collection).countDocuments();
    }
    
    return counts;
  } catch (error) {
    console.error('Error counting documents:', error);
    return {};
  }
}

async function getDetailedReport(type, page = 1) {
  console.log(`--- DETAILED REPORT START ---`);
  console.log(`[getDetailedReport] Called with type: ${type}, page: ${page}`);
  try {
    const db = mongoose.connection.db;
    const perPage = 1;
    const skip = (page - 1) * perPage;

    const collectionMappings = {
      'non-invasive': {
        mistral: 'non-invasive-stage-mistral',
        deepseek: 'non-invasive-stage-deepseek-new'
      },
      'advanced': {
        mistral: 'advanced-stage-biomistral',
        deepseek: 'advanced-stage-deepseek'
      },
      'invasive': {
        mistral: 'invasive-stage-biomistral',
        deepseek: 'invasive-stage-deepseek'
      }
    };
    console.log('[getDetailedReport] Collection Mappings:', collectionMappings);

    const collections = collectionMappings[type];
    if (!collections) {
      console.error(`[getDetailedReport] Invalid type provided: ${type}`);
      return { documents: [], totalPages: 0, currentPage: 1 };
    }
    console.log(`[getDetailedReport] Using collections for type '${type}':`, collections);

    console.log(`[getDetailedReport] Fetching total count from: ${collections.deepseek}`);
    const totalCount = await db.collection(collections.deepseek).countDocuments();
    console.log(`[getDetailedReport] Total count: ${totalCount}`);

    if (totalCount === 0) {
      console.log('[getDetailedReport] No documents found, returning empty set.');
      return { documents: [], totalPages: 0, currentPage: 1 };
    }

    console.log(`[getDetailedReport] Fetching documents from mistral: ${collections.mistral} and deepseek: ${collections.deepseek}`);
    const [mistralDocs, deepseekDocs] = await Promise.all([
      db.collection(collections.mistral).find({}).skip(skip).limit(perPage).toArray(),
      db.collection(collections.deepseek).find({}).skip(skip).limit(perPage).toArray()
    ]);
    console.log(`[getDetailedReport] Fetched docs count: mistral=${mistralDocs.length}, deepseek=${deepseekDocs.length}`);

    const documents = deepseekDocs.map((deepseekDoc, index) => {
      const mistralDoc = mistralDocs[index] || {};
      const combined = {
        ...deepseekDoc,
        'Bio Étiquette': mistralDoc['Étiquette'],
        'Bio Explication de l\'Étiquette': mistralDoc['Explication de l\'Étiquette']
      };
      return combined;
    });
    console.log('[getDetailedReport] Successfully combined documents.');

    const response = {
      documents,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: page
    };
    console.log('[getDetailedReport] Returning response:', response);
    return response;
  } catch (err) {
    console.error(`[getDetailedReport] CRITICAL ERROR for type '${type}':`, err);
    throw err;
  }
}

async function isPageEvaluated(page, type) {
  try {
    const Evaluation = require('../models/Evaluation');
    
    const count = await Evaluation.countDocuments({
      id_report: page,
      type_of_report: type
    });

    return count >= 2;
  } catch (error) {
    console.error('Error checking page evaluations:', error);
    return false;
  }
}

module.exports = {
  getFirstDocuments,
  getCollectionCounts,
  getDetailedReport,
  isPageEvaluated
};
